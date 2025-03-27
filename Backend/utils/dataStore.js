// utils/dataStore.js
const fs = require("fs").promises;
const fsSync = require("fs");

async function readJSON(filePath) {
  try {
    if (!fsSync.existsSync(filePath)) {
      return [];
    }
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    throw err;
  }
}

async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    throw err;
  }
}

// Anchors functions
async function readAnchors(filePath) {
  return readJSON(filePath);
}

async function writeAnchors(filePath, data) {
  return writeJSON(filePath, data);
}

// Profiles functions
async function readProfiles(filePath) {
  return readJSON(filePath);
}

async function writeProfiles(filePath, data) {
  return writeJSON(filePath, data);
}

module.exports = {
  readAnchors,
  writeAnchors,
  readProfiles,
  writeProfiles,
};

// ... (rest of the module remains unchanged)
