import poolDb from '../config/db.js';
import _ from 'lodash';

/**
 * @param {uuid} obj.employee_id 
 * @param {string} obj.activity_type
 * @param {string|undefined} obj.description
 */
export async function insert(obj, db = poolDb) {
  await db.query(`
    INSERT INTO activity_logs (
      employee_id,
      activity_type,
      ${!_.isNil(obj.description) ? 'description' : ''}
    ) VALUES (?);`,
    [[
      obj.employee_id,
      obj.activity_type,
      obj.description
    ]]
  );
}
