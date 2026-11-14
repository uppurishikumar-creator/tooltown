// Sample dataset for demos: `npm run seed`
// Clears the database, then fills it with makers, tools and loans.
// Tools are created through codes.js, so they get real codes TLS-0001, TLS-0002, ...
// For the Postman tests use `npm run reset` instead (they need an EMPTY database).
const db = require('./db');
const queries = require('./queries');
const { createToolWithCode } = require('./codes');

// ---------- 1. Empty every table and restart the id counters ----------
db.exec(`
  DELETE FROM loans;
  DELETE FROM tools;
  DELETE FROM makers;
  DELETE FROM sqlite_sequence;
`);

// ---------- 2. Makers ----------
const makers = [
  ['Ravi Kumar', 'ravi.kumar@example.com'],
  ['Ananya Reddy', 'ananya.reddy@example.com'],
  ['Kiran Rao', 'kiran.rao@example.com'],
  ['Sneha Patel', 'sneha.patel@example.com'],
  ['Vikram Singh', 'vikram.singh@example.com'],
  ['Meera Nair', 'meera.nair@example.com'],
  ['Arif Khan', 'arif.khan@example.com'],
  ['Divya Sharma', 'divya.sharma@example.com'],
];
const makerId = {};
for (const [name, email] of makers) {
  makerId[name] = queries.insertMaker(name, email);
}

// ---------- 3. Tools (codes are generated automatically) ----------
const tools = [
  ['Bosch Cordless Drill', 'drill'],
  ['DeWalt Hammer Drill', 'drill'],
  ['Makita Jigsaw', 'saw'],
  ['Circular Saw', 'saw'],
  ['Hand Saw', 'saw'],
  ['Orbital Sander', 'sander'],
  ['Belt Sander', 'sander'],
  ['Claw Hammer', 'hammer'],
  ['Rubber Mallet', 'hammer'],
  ['Precision Screwdriver Set', 'screwdriver'],
  ['Adjustable Wrench', 'wrench'],
  ['Socket Wrench Set', 'wrench'],
  ['Bar Clamp', 'clamp'],
  ['Glue Gun', 'other'],
  ['Soldering Iron', 'other'],
];
const toolId = {};
for (const [name, kind] of tools) {
  toolId[name] = createToolWithCode({ name, kind }).id;
}

// ---------- 4. Loans ----------
// Dates are relative to today, so the data always looks current.
// [maker, tool, borrowed N days ago, due in N days (negative = already past), returned N days ago or null]
const loans = [
  ['Ravi Kumar',   'Bosch Cordless Drill',      20,  -13, 15],   // returned
  ['Ananya Reddy', 'Makita Jigsaw',             18,  -11, 12],   // returned
  ['Kiran Rao',    'Orbital Sander',            15,   -8,  9],   // returned
  ['Sneha Patel',  'Claw Hammer',               10,   -3,  4],   // returned
  ['Ravi Kumar',   'DeWalt Hammer Drill',       16,   -9, null], // still out, OVERDUE
  ['Vikram Singh', 'Circular Saw',              12,   -5, null], // still out, OVERDUE
  ['Meera Nair',   'Bosch Cordless Drill',       4,    3, null], // still out
  ['Arif Khan',    'Socket Wrench Set',          3,    4, null], // still out
  ['Divya Sharma', 'Soldering Iron',             2,    5, null], // still out
  ['Ananya Reddy', 'Precision Screwdriver Set',  1,    6, null], // still out
];
const insertLoan = db.prepare(`
  INSERT INTO loans (maker_id, tool_id, borrowed_at, due_date, returned_at)
  VALUES (?, ?,
          datetime('now', ?),
          date('now', ?),
          CASE WHEN ? IS NULL THEN NULL ELSE datetime('now', ?) END)
`);
for (const [maker, tool, borrowedAgo, dueIn, returnedAgo] of loans) {
  const returned = returnedAgo === null ? null : `-${returnedAgo} days`;
  insertLoan.run(
    makerId[maker], toolId[tool],
    `-${borrowedAgo} days`,
    `${dueIn >= 0 ? '+' : ''}${dueIn} days`,
    returned, returned,
  );
}

console.log(`Seeded: ${makers.length} makers, ${tools.length} tools (TLS-0001 to TLS-${String(tools.length).padStart(4, '0')}), ${loans.length} loans`);
