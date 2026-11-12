// Part 4 - Search by query parameter
//   GET /tools?kind=drill   -> tools of that kind
//   GET /tools?name=bosch   -> tools whose name contains "bosch" (case-insensitive)
//   GET /tools?kind=drill&name=bosch -> both filters together
const db = require('./db');

function searchTools(query) {
  const { kind, name } = query;
  let sql = 'SELECT * FROM tools WHERE 1 = 1';
  const params = [];

  // Each filter adds a ? placeholder, so the user's text is never put into the SQL itself.
  if (kind) {
    sql += ' AND kind = ?';
    params.push(String(kind).trim().toLowerCase());
  }
  if (name) {
    sql += ' AND name LIKE ?';            // LIKE is case-insensitive for English letters in SQLite
    params.push(`%${String(name).trim()}%`);
  }

  sql += ' ORDER BY id';
  return db.prepare(sql).all(...params);
}

// True when the request has at least one search filter
function hasSearch(query) {
  return Boolean(query.kind || query.name);
}

module.exports = { searchTools, hasSearch };
