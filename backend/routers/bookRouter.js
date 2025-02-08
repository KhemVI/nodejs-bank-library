import express from 'express';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid'
import { z } from 'zod';
import * as book from '../models/bookModel.js';
// import * as modes from '../models/modesModel.js';
import logger from '../config/logger.js';
import db from '../config/db.js';
import { convertStringToNumber } from '../utils/formatter.js';

export const router = express.Router();
router.get('/', getBooks);
router.post('/', addBook);
// router.patch('/', multerMemoryStorage.single("image"), updateItem);
// router.delete('/', deleteItem);

export async function getBooks(req, res, next) {
  try {
    const limitRows = 500;
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
    // add activity logs
    await connection.commit();
    const [results] = await book.getBooks({
      filter: {
        book_id: insertId
      }
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