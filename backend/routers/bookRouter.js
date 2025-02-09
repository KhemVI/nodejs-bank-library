import express from 'express';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid'
import { z } from 'zod';
import * as book from '../models/bookModel.js';
import * as activityLog from '../models/activityLogModel.js';
import logger from '../config/logger.js';
import db from '../config/db.js';
import { convertStringToNumber } from '../utils/formatter.js';

export const router = express.Router();
router.get('/', getBooks);
router.post('/', addBook);
router.put('/', updateBook);
router.delete('/', deleteBook);

export async function getBooks(req, res, next) {
  try {
    const limitRows = 250;
    const { query } = req;
    const {
      book_id,
      title,
      author,
      isbn,
      category_id,
      publish_year,
      status,
      limit,
      offset
    } = query;
    const [results] = await book.getBooks({
      filter: {
        book_id,
        title,
        author,
        isbn,
        category_id,
        publish_year: convertStringToNumber(publish_year),
        status
      },
      paginator: {
        limit: convertStringToNumber(limit) > limitRows ? limitRows: convertStringToNumber(limit),
        offset: convertStringToNumber(offset),
      }
    });
    return res.status(200).send({
      data: results,
      message: "success",
    });
  } catch (err) {
    logger.customError(req, err);
    return res.status(400).send({
      status: "failure",
      message: err.message
    });
  }
}

export async function addBook(req, res, next) {
  let connection;
  try {
    const { body } = req;
    const bodySchema = z.object({
      title: z.string().trim().min(1).max(511),
      author: z.string().optional(),
      isbn: z.string().min(13).max(20),
      category_id: z.string().trim().min(1).max(63),
      publish_year: z.number().int().min(0).max(65535).optional(),
      status: z.enum(["active", "suspended"]).optional(),
      employee_id_created_by: z.string().length(36),
      employee_id_updated_by: z.string().length(36)
    });
    const validator = bodySchema.safeParse(body);
    if (!validator.success) {
      return res.status(400).send({
        status: "failure",
        message: "Validation Failed!",
        issues: validator.error?.issues
      });
    }
    const insertId = uuidv1();
    connection = await db.getConnection();
    await book.addBook({ book_id: insertId, ...body }, connection);
    await connection.commit();
    const [results] = await book.getBooks({
      filter: {
        book_id: insertId
      }
    }, connection);
    await activityLog.insert({
      employee_id: body.employee_id_created_by,
      activity_type: "book/add",
      description: JSON.stringify(results)
    });
    db.releaseConnection();
    return res.status(200).send({
      data: results,
      message: "success",
    });
  } catch (err) {
    logger.customError(req, err);
    if (connection) {
      await connection.rollback();
      db.releaseConnection();
    }
    return res.status(400).send({
      status: "failure",
      message: err.message
    });
  }
}

export async function updateBook(req, res, next) {
  let connection;
  try {
    const { body } = req;
    const bodySchema = z.object({
      book_id: z.string().length(36),
      title: z.string().trim().min(1).max(511),
      author: z.string().optional(),
      isbn: z.string().min(13).max(20),
      category_id: z.string().trim().min(1).max(63),
      publish_year: z.number().int().min(0).max(65535).optional(),
      status: z.enum(["active", "suspended"]).optional(),
      employee_id_created_by: z.string().length(36),
      employee_id_updated_by: z.string().length(36)
    });
    const validator = bodySchema.safeParse(body);
    if (!validator.success) {
      return res.status(400).send({
        status: "failure",
        message: "Validation Failed!",
        issues: validator.error?.issues
      });
    }
    connection = await db.getConnection();
    const [beforeResults] = await book.getBooks({
      filter: {
        book_id: body.book_id
      }
    }, connection);
    await book.updateBook(body, connection);
    await connection.commit();
    const [results] = await book.getBooks({
      filter: {
        book_id: body.book_id
      }
    }, connection);
    await activityLog.insert({
      employee_id: body.employee_id_created_by,
      activity_type: "book/update",
      description: JSON.stringify({
        before: beforeResults,
        after: results
      })
    });
    db.releaseConnection();
    return res.status(200).send({
      data: results,
      message: "success",
    });
  } catch (err) {
    logger.customError(req, err);
    if (connection) {
      await connection.rollback();
      db.releaseConnection();
    }
    return res.status(400).send({
      status: "failure",
      message: err.message
    });
  }
}

export async function deleteBook(req, res, next) {
  let connection;
  try {
    const { body } = req;
    const bodySchema = z.object({
      book_id: z.string().length(36),
      employee_id_updated_by: z.string().length(36)
    });
    const validator = bodySchema.safeParse(body);
    if (!validator.success) {
      return res.status(400).send({
        status: "failure",
        message: "Validation Failed!",
        issues: validator.error?.issues
      });
    }
    connection = await db.getConnection();
    const [results] = await book.getBooks({
      filter: {
        book_id: body.book_id
      }
    }, connection);
    await book.softDeleteBook(body, connection);
    if (results.length > 0) {
      await activityLog.insert({
        employee_id: body.employee_id_updated_by,
        activity_type: "book/softDelete",
        description: JSON.stringify({
          book_id: body.book_id
        })
      });
    }
    await connection.commit();
    db.releaseConnection(); 
    return res.status(200).send({
      data: results.map(row => { return {deleted_id: row.book_id} }),
      message: "success",
    });
  } catch (err) {
    logger.customError(req, err);
    if (connection) {
      await connection.rollback();
      db.releaseConnection();
    }
    return res.status(400).send({
      status: "failure",
      message: err.message
    });
  }
}