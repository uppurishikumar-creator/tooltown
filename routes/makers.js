// Part 3 - REST endpoints: makers
const express = require('express');
const queries = require('../queries');
const { validateMaker, parseId } = require('../validation');

const router = express.Router();

// GET /makers    200
router.get('/', (req, res) => {
  res.status(200).json(queries.getAllMakers());
});

// GET /makers/:id    200 / 400 / 404
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

  const maker = queries.getMakerById(id);
  if (!maker) return res.status(404).json({ error: `Maker ${id} not found` });

  res.status(200).json(maker);
});

// POST /makers    201 / 400 / 409
router.post('/', (req, res) => {
  const error = validateMaker(req.body);
  if (error) return res.status(400).json({ error });

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();

  if (queries.getMakerByEmail(email)) {
    return res.status(409).json({ error: `A maker with email ${email} already exists` });
  }

  const id = queries.insertMaker(name, email);
  res.status(201).json(queries.getMakerById(id));
});

module.exports = router;
