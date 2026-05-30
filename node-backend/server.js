require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  process.stderr.write('FATAL: MONGO_URI is not defined in environment variables\n');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      process.stdout.write(`Server running on port ${PORT}\n`);
    });
  })
  .catch((err) => {
    process.stderr.write(`Database connection failed: ${err.message}\n`);
    process.exit(1);
  });
