import poolDb from '../config/db.js';
import _ from 'lodash';

const visibleFields = [
  'book_id',
  'title',
  'author',
  'isbn',
  'category_id',
  'publish_year',
  'status'
]
/**
 * @param {uuid|undefined}   obj.filter.book_id
 * @param {string|undefined} obj.filter.title
 * @param {string|undefined} obj.filter.author
 * @param {string|undefined} obj.filter.isbn
 * @param {uuid|undefined}   obj.filter.category_id
 * @param {enum|"active"}   obj.filter.status
 * @param {number|0} obj.paginator.offet
 * @param {number|50}   obj.paginator.limit
 */
export async function getBooks(obj, db = poolDb) {
  const [results] = await db.query(
    `SELECT ${visibleFields.join(',')} FROM books WHERE book_id = ? LIMIT 50;`,
    [obj.filter.book_id]
  );
  return results;
}

/**
 * @param {uuid} obj.book_id 
 * @param {string} obj.title
 * @param {string|undefined} obj.author
 * @param {string} obj.isbn 
 * @param {string} obj.category_id
 * @param {number} obj.publish_year
 * @param {enum} obj.status 
 * @param {string} obj.employee_id_created_by
 * @param {string} obj.employee_id_updated_by
 */
export async function addBook(obj, db = poolDb) {
  await db.query(`
    INSERT INTO books (
      book_id,
      title,
      ${!_.isNil(obj.author)? 'author,' : ''}
      isbn,
      ${!_.isNil(obj.publish_year) ? 'publish_year,' : ''}
      ${!_.isNil(obj.status) ? 'status,' : ''}
      ${!_.isNil(obj.employee_id_created_by) ? 'employee_id_created_by,' : ''}
      ${!_.isNil(obj.employee_id_updated_by) ? 'employee_id_updated_by,' : ''}
      category_id
    ) VALUES (?);`,
    [[
      obj.book_id,
      obj.title,
      obj.author,
      obj.isbn,
      obj.publish_year,
      obj.status,
      obj.employee_id_created_by,
      obj.employee_id_updated_by,
      obj.category_id
    ].filter(value => !_.isNil(value))]
  );
}
