// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const { readProfiles, writeProfiles } = require("../utils/dataStore");

const profileFilePath = path.join(__dirname, "../profiles.json");

// POST /profile - Submit or update a profile
router.post("/profile", async (req, res) => {
  try {
    console.log("🧾 Received profile submission:", req.body);
    const { public_key, username, bio, verification_level, kaspa_address } = req.body;
    if (
      !public_key ||
      typeof public_key !== "string" ||
      !public_key.startsWith("04") ||
      !username ||
      typeof username !== "string" ||
      typeof verification_level !== "number" ||
      verification_level < 1 ||
      verification_level > 5
    ) {
      return res.status(400).json({ message: "Missing or invalid profile fields." });
    }
    let profiles = await readProfiles(profileFilePath);
    const index = profiles.findIndex(p => p.public_key === public_key);
    const profile = {
      public_key,
      username,
      bio,
      verification_level,
      kaspa_address,
      updated_at: new Date().toISOString()
    };
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    await writeProfiles(profileFilePath, profiles);
    res.status(200).json({ message: "Profile saved", profile });
  } catch (err) {
    console.error("Error in POST /profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profile/:publicKey - Retrieve a profile
router.get("/profile/:publicKey", async (req, res) => {
  try {
    const publicKey = req.params.publicKey;
    let profiles = await readProfiles(profileFilePath);
    const profile = profiles.find(p => p.public_key === publicKey);
    if (!profile) {
      return res.status(404).json({ message: `Profile for ${publicKey} not found.` });
    }
    res.status(200).json({ profile });
  } catch (err) {
    console.error("Error in GET /profile/:publicKey", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
