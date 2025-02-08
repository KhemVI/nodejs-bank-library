import poolDb from '../config/db.js';
import _ from 'lodash';

const visibleFields = [
  'book_id',
  'title',
  'author',
  'isbn',
  'category_id',
  'publish_year',
  'status',
  'created_at',
  'updated_at'
]
/**
 * @param {uuid|undefined}    obj.filter.book_id
 * @param {string|undefined}  obj.filter.title
 * @param {string|undefined}  obj.filter.author
 * @param {string|undefined}  obj.filter.isbn
 * @param {uuid|undefined}    obj.filter.category_id
 * @param {number|undefined}  obj.filter.publish_year
 * @param {enum|"active"}     obj.filter.status
 * @param {number|1}          obj.paginator.limit
 * @param {number|0}          obj.paginator.offset
 */
export async function getBooks(obj, db = poolDb) {
  const results = await db.query(
    `SELECT ${visibleFields.join(',')}
     FROM books
     WHERE ${!_.isNil(obj.filter?.book_id) ? 'book_id = ? AND ' : ''}
     ${!_.isNil(obj.filter?.title) ? 'title = ? AND ' : ''}
     ${!_.isNil(obj.filter?.author) ? 'author = ? AND ' : ''}
     ${!_.isNil(obj.filter?.isbn) ? 'isbn = ? AND ' : ''}
     ${!_.isNil(obj.filter?.category_id) ? 'category_id = ? AND ' : ''}
     ${!_.isNil(obj.filter?.publish_year) ? 'publish_year = ? AND ' : ''}
     ${!_.isNil(obj.filter?.status) ? 'status = ? AND' : 'status = "active" AND'}
     deleted_at IS NULL
     LIMIT ${!_.isNil(obj.paginator?.limit) ? '?' : '1'}
     OFFSET ${!_.isNil(obj.paginator?.offset) ? '?' : '0'};`,
    [
      ...[
        obj.filter?.book_id,
        obj.filter?.title,
        obj.filter?.author,
        obj.filter?.isbn,
        obj.filter?.category_id,
        obj.filter?.publish_year,
        obj.filter?.status,
        obj.paginator?.limit,
        obj.paginator?.offset
      ].filter(value => !_.isNil(value))
    ]
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
      ${!_.isNil(obj.author) ? 'author,' : ''}
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
