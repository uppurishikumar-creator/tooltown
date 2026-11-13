// Part 2 - Database: all the SQL queries in one place.
// Every query uses ? placeholders (parameterised), never string concatenation,
// so user input can never change the SQL (no SQL injection).
const db = require('./db');

// ---------- Tools ----------
const getAllTools = () => db.prepare('SELECT * FROM tools ORDER BY id').all();

const getToolById = (id) => db.prepare('SELECT * FROM tools WHERE id = ?').get(id);

// Returns the new row id
const insertTool = (name, kind) =>
  Number(db.prepare('INSERT INTO tools (name, kind) VALUES (?, ?)').run(name, kind).lastInsertRowid);

const setToolCode = (id, code) => db.prepare('UPDATE tools SET code = ? WHERE id = ?').run(code, id);

// Only name and kind are updated. The code column is never touched here.
const updateTool = (id, name, kind) =>
  db.prepare('UPDATE tools SET name = ?, kind = ? WHERE id = ?').run(name, kind, id);

const deleteTool = (id) => db.prepare('DELETE FROM tools WHERE id = ?').run(id);

const countLoansForTool = (toolId) =>
  db.prepare('SELECT COUNT(*) AS n FROM loans WHERE tool_id = ?').get(toolId).n;

// ---------- Makers ----------
const getAllMakers = () => db.prepare('SELECT * FROM makers ORDER BY id').all();

const getMakerById = (id) => db.prepare('SELECT * FROM makers WHERE id = ?').get(id);

const getMakerByEmail = (email) => db.prepare('SELECT * FROM makers WHERE email = ?').get(email);

// Returns the new row id
const insertMaker = (name, email) =>
  Number(db.prepare('INSERT INTO makers (name, email) VALUES (?, ?)').run(name, email).lastInsertRowid);

// ---------- Loans ----------
// The JOIN: each loan with the maker name and the tool name.
const LOAN_JOIN_SQL = `
  SELECT loans.id,
         makers.name  AS maker_name,
         tools.name   AS tool_name,
         tools.code   AS tool_code,
         loans.borrowed_at,
         loans.due_date,
         loans.returned_at
  FROM loans
  JOIN makers ON loans.maker_id = makers.id
  JOIN tools  ON loans.tool_id  = tools.id
`;

// activeOnly = true -> only tools that are still out (returned_at IS NULL)
const getAllLoans = (activeOnly = false) =>
  db.prepare(LOAN_JOIN_SQL + (activeOnly ? ' WHERE loans.returned_at IS NULL' : '') + ' ORDER BY loans.id').all();

// One loan, joined with maker and tool names
const getLoanById = (id) => db.prepare(LOAN_JOIN_SQL + ' WHERE loans.id = ?').get(id);

// One loan, raw row from the loans table
const getLoanRow = (id) => db.prepare('SELECT * FROM loans WHERE id = ?').get(id);

const getActiveLoanForTool = (toolId) =>
  db.prepare('SELECT * FROM loans WHERE tool_id = ? AND returned_at IS NULL').get(toolId);

// Returns the new row id
const insertLoan = (makerId, toolId, dueDate) =>
  Number(db.prepare('INSERT INTO loans (maker_id, tool_id, due_date) VALUES (?, ?, ?)')
    .run(makerId, toolId, dueDate ?? null).lastInsertRowid);

const markLoanReturned = (id) =>
  db.prepare('UPDATE loans SET returned_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

module.exports = {
  getAllTools, getToolById, insertTool, setToolCode, updateTool, deleteTool, countLoansForTool,
  getAllMakers, getMakerById, getMakerByEmail, insertMaker,
  getAllLoans, getLoanById, getLoanRow, getActiveLoanForTool, insertLoan, markLoanReturned,
};
