// Part 3 - REST endpoints: tools CRUD
// Uses: queries (Part 2), validation + search (Part 4), automatic codes (Part 5)
const express = require('express');
const queries = require('../queries');
const { validateTool, parseId } = require('../validation');
const { searchTools, hasSearch } = require('../search');
const { editableToolFields, createToolWithCode } = require('../codes');

const router = express.Router();

// GET /tools            -> all tools                    200
// GET /tools?kind=drill -> search by query parameter    200
router.get('/', (req, res) => {
  const tools = hasSearch(req.query) ? searchTools(req.query) : queries.getAllTools();
  res.status(200).json(tools);
});

// GET /tools/:id -> one tool    200 / 400 / 404
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  const tool = queries.getToolById(id);
  if (!tool) return res.status(404).json({ error: `Tool ${id} not found` });

  res.status(200).json(tool);
});

// POST /tools -> add a tool, server sets the code    201 / 400
router.post('/', (req, res) => {
  const error = validateTool(req.body);
  if (error) return res.status(400).json({ error });

  const tool = createToolWithCode(editableToolFields(req.body));
  res.status(201).json(tool);
});

// PUT /tools/:id -> update name and kind, code never changes    200 / 400 / 404
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  if (!queries.getToolById(id)) return res.status(404).json({ error: `Tool ${id} not found` });

  const error = validateTool(req.body);
  if (error) return res.status(400).json({ error });

  const { name, kind } = editableToolFields(req.body);
  queries.updateTool(id, name, kind);
  res.status(200).json(queries.getToolById(id));
});

// DELETE /tools/:id    200 / 400 / 404 / 409
router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  const tool = queries.getToolById(id);
  if (!tool) return res.status(404).json({ error: `Tool ${id} not found` });

  if (queries.countLoansForTool(id) > 0) {
    return res.status(409).json({ error: `Tool ${tool.code} has loan records and cannot be deleted` });
  }

  queries.deleteTool(id);
  res.status(200).json({ message: `Tool ${tool.code} deleted`, tool });
});

module.exports = router;
