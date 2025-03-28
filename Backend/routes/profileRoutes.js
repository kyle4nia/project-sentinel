const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const profilesPath = path.join(__dirname, "../Data/profiles.json");

// Helper to load profiles
function loadProfiles() {
  if (!fs.existsSync(profilesPath)) return { profiles: [] };
  return JSON.parse(fs.readFileSync(profilesPath));
}

// Helper to save profiles
function saveProfiles(data) {
  fs.writeFileSync(profilesPath, JSON.stringify(data, null, 2));
}

// POST /profile — Add or update a profile
router.post("/profile", (req, res) => {
  const { public_key, username, bio, verification_level, kaspa_address } = req.body;
  if (!public_key || !username || !kaspa_address || !verification_level) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const data = loadProfiles();
  let profiles = data.profiles;

  const existingIndex = profiles.findIndex((p) => p.public_key === public_key);
  const newProfile = { public_key, username, bio, verification_level, kaspa_address };

  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profiles[existingIndex], ...newProfile };
  } else {
    profiles.push(newProfile);
  }

  saveProfiles({ profiles });

  console.log("🧾 Profile saved:", newProfile);
  res.json({ status: "ok", profile: newProfile });
});

// GET /profile/:pubkey — Fetch profile by public key
router.get("/profile/:pubkey", (req, res) => {
  const pubkey = req.params.pubkey;
  const data = loadProfiles();
  const profile = data.profiles.find((p) => p.public_key === pubkey);

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.json({ profile });
});

module.exports = router;
