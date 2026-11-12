// Part 1 - Server and routes
const express = require('express');

const makersRouter = require('./routes/makers');
const toolsRouter = require('./routes/tools');
const loansRouter = require('./routes/loans');

const app = express();
const PORT = process.env.PORT || 3000;

// Read JSON request bodies into req.body
app.use(express.json());

// Home route: quick check that the server is up
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ToolTown Makerspace API',
    endpoints: ['/makers', '/tools', '/loans'],
  });
});

app.use('/makers', makersRouter);
app.use('/tools', toolsRouter);
app.use('/loans', loansRouter);

// Unknown route -> 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler: bad JSON -> 400, anything else -> 500
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Only start listening when run directly (lets tests import the app)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ToolTown API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
