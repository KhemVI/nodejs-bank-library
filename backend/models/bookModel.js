import poolDb from '../config/db.js';
import _ from 'lodash';

/**
 * @param {uuid} body.book_id 
 * @param {string} body.title
 * @param {string|undefined} body.author
 * @param {string} body.isbn 
 * @param {string} body.category_id
 * @param {number} body.publish_year
 * @param {enum} body.status 
 * @param {string} body.employee_id_created_by
 * @param {string} body.employee_id_updated_by
 */
export async function addBook(body, db = poolDb) {
  await db.query(`
    INSERT INTO books (
      book_id,
      title,
      ${!_.isNil(body.author)? 'author,' : ''}
      isbn,
      ${!_.isNil(body.publish_year) ? 'publish_year,' : ''}
      ${!_.isNil(body.status) ? 'status,' : ''}
      ${!_.isNil(body.employee_id_created_by) ? 'employee_id_created_by,' : ''}
      ${!_.isNil(body.employee_id_updated_by) ? 'employee_id_updated_by,' : ''}
      category_id
    ) VALUES (?);`,
    [[
      body.book_id,
      body.title,
      body.author,
      body.isbn,
      body.publish_year,
      body.status,
      body.employee_id_created_by,
      body.employee_id_updated_by,
      body.category_id
    ].filter(value => !_.isNil(value))]
  );
}
