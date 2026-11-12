// Part 5 - Twist rule: automatic codes
// The server gives every new tool a code such as TLS-0001, then TLS-0002.
// The client cannot set it, and an update never changes it.
const db = require('./db');
const queries = require('./queries');

// id 1 -> "TLS-0001", id 2 -> "TLS-0002", id 15 -> "TLS-0015"
function makeCode(id) {
  return 'TLS-' + String(id).padStart(4, '0');
}

// Rule: the client cannot set or change the code.
// Only name and kind are taken from the request body; any "code" the client sends is dropped.
function editableToolFields(body) {
  return {
    name: body.name.trim(),
    kind: body.kind.trim().toLowerCase(),
  };
}

// Rule: the server creates the code.
// Insert the tool, build its code from the new id, save the code.
// Both steps run in ONE transaction, so a tool can never exist without its code.
// The id column uses AUTOINCREMENT, so ids (and codes) are never reused after a delete.
function createToolWithCode({ name, kind }) {
  db.exec('BEGIN');
  try {
    const id = queries.insertTool(name, kind);
    queries.setToolCode(id, makeCode(id));
    db.exec('COMMIT');
    return queries.getToolById(id);
  } catch (err) {
    db.exec('ROLLBACK'); // undo the insert if anything failed
    throw err;
  }
}

module.exports = { makeCode, editableToolFields, createToolWithCode };
