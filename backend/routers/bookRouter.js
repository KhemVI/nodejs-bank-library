import express from 'express';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid'
import { z } from 'zod';
import * as book from '../models/bookModel.js';
// import * as modes from '../models/modesModel.js';
import logger from '../config/logger.js';
import db from '../config/db.js';

export const router = express.Router();
// router.get('/:id', getItem);
router.post('/', addBook);
// router.patch('/', multerMemoryStorage.single("image"), updateItem);
// router.delete('/', deleteItem);

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
    await book.addBook({ book_id: insertId, ...body });
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


// adding, updating, and deleting books, and searching for books by different criteria

// export async function getItem(req, res, next) {
//   try {
//     const { params } = req;
//     const validationList = [
//       { key: 'id', type: 'uuid' }
//     ];
//     const validateErrors = errorMsg(params, validationList);
//     if (validateErrors.length > 0) {
//       return res.status(400).send({ message: "Invalid inputs", errors: validateErrors });
//     }
//     const [itemResults] = await db.query(`
//       SELECT * FROM items where id = ? AND store_id = ? LIMIT 1;
//     `, [params.id, req.decodedToken.storeId]);
//     const [results] = await items.mappingItemResults(itemResults);
//     res.status(200).send({
//       data: results,
//       message: "success",
//     });
//   } catch (err) {
//     logger.customError(req, err);
//     res.status(400).send({
//       status: "failure",
//       message: err.message
//     });
//   }
// }

// export async function addItem(req, res, next) {
//   let connection;
//   try {
//     const { file, body } = req;
//     const validationList = [
//       { key: 'title', type: 'string' },
//       { key: 'tag', type: 'null|string', length: 64 },
//       { key: 'price', type: 'null|string_number' },
//       { key: 'status', type: 'null|enum', enumValues: ITEMS_ENUM_STATUS },
//       { key: 'cardRibbon', type: 'null|string', length: 64 },
//       { key: 'currency', type: 'null|string', length: 16 },
//       { key: 'content', type: 'null|string', length: 2047 },
//       { key: 'additionalContent', type: 'null|string', length: 2047 },
//       { key: 'modeNames', type: 'array' }
//     ];
//     body.modeNames = is('string_array', body.modeNames) ? JSON.parse(body.modeNames) : body.modeNames;
//     const modeEnumIds = await modes.enumIds(req.decodedToken.storeId);
//     for (let i = 0; i < _.get(body, 'modeNames.length'); i++) {
//       validationList.push({ key: `modeNames.${i}`, type: 'enum', enumValues: modeEnumIds });
//     }
//     const validateErrors = errorMsg(body, validationList);
//     if (validateErrors.length > 0) {
//       return res.status(400).send({ message: "Invalid inputs", errors: validateErrors });
//     }
//     if (await items.isDuplicatedTitle(body.title, req.decodedToken.storeId)) {
//       return res.status(400).send({
//         message: "Invalid inputs", errors: [{
//           key: 'title',
//           detail: 'Avoid duplicating title'
//         }]
//       });
//     }
//     const insertId = uuidv1();
//     const { imageUrl, uploadError } = await uploadImageFile(file, `public/${req.decodedToken.storeId}/items/${insertId}`);
//     if (uploadError) {
//       return res.status(400).send({
//         message: "Invalid inputs", errors: [{
//           key: 'image',
//           detail: uploadError
//         }]
//       });
//     }
//     connection = await db.getConnection();
//     await connection.beginTransaction();
//     await items.addItem(
//       { ...body, id: insertId, imageUrl },
//       req.decodedToken,
//       connection
//     );
//     await connection.commit();
//     const [results] = await items.getItem(insertId, connection);
//     db.releaseConnection();
//     res.status(200).send({
//       data: results,
//       message: "success",
//     });
//   } catch (err) {
//     logger.customError(req, err);
//     if (connection) {
//       await connection.rollback();
//       db.releaseConnection();
//     }
//     res.status(400).send({
//       status: "failure",
//       message: err.message
//     });
//   }
// }

// export async function updateItem(req, res, next) {
//   let connection;
//   try {
//     const { file, body } = req;
//     const validationList = [
//       { key: 'id', type: 'uuid' },
//       { key: 'title', type: 'string' },
//       { key: 'tag', type: 'null|string', length: 64 },
//       { key: 'price', type: 'null|string_number' },
//       { key: 'status', type: 'null|enum', enumValues: ITEMS_ENUM_STATUS },
//       { key: 'cardRibbon', type: 'null|string', length: 64 },
//       { key: 'currency', type: 'null|string', length: 16 },
//       { key: 'content', type: 'null|string', length: 2047 },
//       { key: 'additionalContent', type: 'null|string', length: 2047 },
//       { key: 'modeNames', type: 'array' }
//     ];
//     body.modeNames = is('string_array', body.modeNames) ? JSON.parse(body.modeNames) : body.modeNames;
//     const modeEnumIds = await modes.enumIds(req.decodedToken.storeId);
//     for (let i = 0; i < _.get(body, 'modeNames.length'); i++) {
//       validationList.push({ key: `modeNames.${i}`, type: 'enum', enumValues: modeEnumIds });
//     }
//     const validateErrors = errorMsg(body, validationList);
//     if (validateErrors.length > 0) {
//       return res.status(400).send({ message: "Invalid inputs", errors: validateErrors });
//     }
//     const hasItem = await items.hasItem(body.id, req.decodedToken.storeId, db);
//     if (!hasItem) {
//       throw { message: `The item ID was not found`, logActive: false };
//     }
//     if (await items.isDuplicatedTitle(body.title, req.decodedToken.storeId, [hasItem.title])) {
//       return res.status(400).send({
//         message: "Invalid inputs", errors: [{
//           key: 'title',
//           detail: 'Avoid duplicating title'
//         }]
//       });
//     }
//     let imageUrl;
//     if (file) {
//       const uploadResult = await uploadImageFile(file, `public/${req.decodedToken.storeId}/items/${body.id}`);
//       const uploadError = uploadResult.uploadError;
//       imageUrl = uploadResult.imageUrl;
//       if (uploadError) {
//         return res.status(400).send({
//           message: "Invalid inputs", errors: [{
//             key: 'image',
//             detail: uploadError
//           }]
//         });
//       }
//     }
//     connection = await db.getConnection();
//     await connection.beginTransaction();
//     await items.updateItem(
//       { ...body, imageUrl },
//       req.decodedToken,
//       connection
//     );
//     const [results] = await items.getItem(body.id, connection);
//     await connection.commit();
//     db.releaseConnection();
//     res.status(200).send({
//       data: results,
//       message: "success",
//     });
//   } catch (err) {
//     logger.customError(req, err);
//     if (connection) {
//       await connection.rollback();
//       db.releaseConnection();
//     }
//     res.status(400).send({
//       status: "failure",
//       message: err.message
//     });
//   }
// }

// export async function deleteItem(req, res, next) {
//   try {
//     const { body } = req;
//     const validateErrors = errorMsg(body, [
//       { key: 'id', type: 'uuid' },
//     ]);
//     if (validateErrors.length > 0) {
//       return res.status(400).send({ message: "Invalid inputs", errors: validateErrors });
//     }
//     const hasItem = await items.hasItem(body.id, req.decodedToken.storeId, db);
//     if (!hasItem) {
//       throw { message: `The item ID was not found`, logActive: false };
//     }
//     await items.deleteItem(body.id, db);
//     res.status(200).send({
//       data: { id: body.id },
//       message: "success",
//     });
//   } catch (err) {
//     logger.customError(req, err);
//     res.status(400).send({
//       status: "failure",
//       message: err.message
//     });
//   }
// }