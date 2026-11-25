'use strict';

const { initDb } = require('./db');
const app = require('./app');
const { PORT } = require('./config');

// Initialize DB first (sql.js requires async init), then start server
initDb()
  .then(() => {
    app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
      console.log(`\n  Task Manager API is running`);
      console.log(`  ➜  Local:  http://localhost:${PORT}`);
      console.log(`  ➜  Health: http://localhost:${PORT}/health\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
