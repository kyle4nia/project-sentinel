// index.js
const express = require("express");
const path = require("path");

// Import modular routes
const anchorRoutes = require("./routes/anchorRoutes");
const profileRoutes = require("./routes/profileRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Mount routes
app.use("/", anchorRoutes);
app.use("/", profileRoutes);
app.use("/", voteRoutes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
import runNightOps from './utils/nightOpsDaemon.js';
runNightOps(); // Starts background loop

