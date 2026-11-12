// Part 3 - REST endpoints: loans, including the JOIN endpoint
const express = require('express');
const queries = require('../queries');
const { validateLoan, parseId } = require('../validation');

const router = express.Router();

// GET /loans             -> JOIN: every loan with maker name and tool name    200
// GET /loans?active=true -> only tools that are still out                     200
router.get('/', (req, res) => {
  res.status(200).json(queries.getAllLoans(req.query.active === 'true'));
});

// GET /loans/:id    200 / 400 / 404
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  const loan = queries.getLoanById(id);
  if (!loan) return res.status(404).json({ error: `Loan ${id} not found` });

  res.status(200).json(loan);
});

// POST /loans -> a maker borrows a tool    201 / 400 / 404 / 409
router.post('/', (req, res) => {
  const error = validateLoan(req.body);
  if (error) return res.status(400).json({ error });

  const { maker_id, tool_id, due_date } = req.body;

  if (!queries.getMakerById(maker_id)) return res.status(404).json({ error: `Maker ${maker_id} not found` });

  const tool = queries.getToolById(tool_id);
  if (!tool) return res.status(404).json({ error: `Tool ${tool_id} not found` });

  if (queries.getActiveLoanForTool(tool_id)) {
    return res.status(409).json({ error: `Tool ${tool.code} is already on loan` });
  }

  const id = queries.insertLoan(maker_id, tool_id, due_date);
  res.status(201).json(queries.getLoanById(id));
});

// PATCH /loans/:id/return -> mark the tool as returned    200 / 400 / 404 / 409
router.patch('/:id/return', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  const loan = queries.getLoanRow(id);
  if (!loan) return res.status(404).json({ error: `Loan ${id} not found` });
  if (loan.returned_at) return res.status(409).json({ error: `Loan ${id} was already returned` });

  queries.markLoanReturned(id);
  res.status(200).json(queries.getLoanById(id));
});

module.exports = router;
