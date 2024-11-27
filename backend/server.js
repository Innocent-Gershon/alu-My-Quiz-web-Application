// server.js
const express = require('express');
const app = express();
const port = 3000; // You can change this to any port you prefer

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route to test the backend
app.get('/', (req, res) => {
  res.send('Welcome to the Quiz API!');
});

// Import routes
// You will create these routes in the 'routes' folder later

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
