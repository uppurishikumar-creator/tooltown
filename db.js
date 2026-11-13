// Part 2 - Database
// Creates the SQLite database file and the 3 related tables: makers, tools, loans.
// Uses Node's built-in SQLite module (Node 22.13+), so nothing needs to be compiled.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'tooltown.db');
const db = new DatabaseSync(DB_FILE);

// SQLite does not enforce foreign keys unless this is switched on.
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS makers (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  );

  -- AUTOINCREMENT means an id is never reused, even after a delete,
  -- so the TLS code built from the id is never reused either.
  CREATE TABLE IF NOT EXISTS tools (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,            -- TLS-0001, set by the server only
    name TEXT NOT NULL,
    kind TEXT NOT NULL
  );

  -- One maker has many loans, one tool has many loans.
  CREATE TABLE IF NOT EXISTS loans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    maker_id    INTEGER NOT NULL REFERENCES makers(id),
    tool_id     INTEGER NOT NULL REFERENCES tools(id),
    borrowed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date    TEXT,
    returned_at TEXT              -- NULL means the tool is still out
  );
`);

console.log(`Database ready: ${path.basename(DB_FILE)} (makers, tools, loans)`);

module.exports = db;
