const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ec: EC } = require("elliptic");

const app = express();
const port = 3000;
const ec = new EC("secp256k1");
const anchorLogPath = "anchored-cids.json";

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// POST /anchor - Accept signed CID submission
app.post("/anchor", (req, res) => {
  const { cid, note, signed_by, signature } = req.body;

  if (!cid) {
    return res.status(400).json({ message: "CID is required." });
  }

  const message = cid + note;
  const msgHash = crypto.createHash("sha256").update(message).digest();

  console.log("🔍 Backend message:", message);
  console.log("🔍 Backend hash:", msgHash.toString("hex"));
  console.log("🔍 Signature received:", signature);

  let is_valid = false;
  try {
    const key = ec.keyFromPublic(signed_by, "hex");
    is_valid = key.verify(msgHash, Buffer.from(signature, "hex"));
    console.log("✅ Signature is valid (backend)?", is_valid);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
  }

  const anchor = {
    cid,
    note,
    signed_by,
    signature,
    anchor_block: Math.floor(Math.random() * 100) + 1,
    timestamp: new Date().toISOString(),
    verified_by: "sentinel-local-devnet",
    is_valid,
  };

  let anchors = [];
  if (fs.existsSync(anchorLogPath)) {
    anchors = JSON.parse(fs.readFileSync(anchorLogPath));
  }

  anchors.push(anchor);
  fs.writeFileSync(anchorLogPath, JSON.stringify(anchors, null, 2));

  res.status(201).json({ message: "CID anchored", anchor });
});

// GET /anchors - Retrieve all anchors
app.get("/anchors", (req, res) => {
  if (!fs.existsSync(anchorLogPath)) {
    return res.status(404).json({ message: "No anchors found yet." });
  }

  const anchors = JSON.parse(fs.readFileSync(anchorLogPath));
  res.status(200).json({ anchors });
});

// GET /anchor/:cid - Retrieve specific CID
app.get("/anchor/:cid", (req, res) => {
  const cidToFind = req.params.cid;

  if (!fs.existsSync(anchorLogPath)) {
    return res.status(404).json({ message: "No anchors found." });
  }

  const anchors = JSON.parse(fs.readFileSync(anchorLogPath));
  const match = anchors.find((a) => a.cid === cidToFind);

  if (!match) {
    return res.status(404).json({ message: `CID ${cidToFind} not found.` });
  }

  res.status(200).json({ anchor: match });
});

// POST /vote - Upvote a CID
app.post("/vote", (req, res) => {
  const { cid } = req.body;

  if (!cid) return res.status(400).json({ message: "CID is required." });
  if (!fs.existsSync(anchorLogPath))
    return res.status(404).json({ message: "No anchors found." });

  const anchors = JSON.parse(fs.readFileSync(anchorLogPath));
  const index = anchors.findIndex((a) => a.cid === cid);

  if (index === -1) {
    return res.status(404).json({ message: `CID ${cid} not found.` });
  }

  anchors[index].votes = (anchors[index].votes || 0) + 1;
  fs.writeFileSync(anchorLogPath, JSON.stringify(anchors, null, 2));

  res
    .status(200)
    .json({ message: "Vote recorded.", total_votes: anchors[index].votes });
});

// POST /flag - Flag a CID
app.post("/flag", (req, res) => {
  const { cid } = req.body;

  if (!cid) return res.status(400).json({ message: "CID is required." });
  if (!fs.existsSync(anchorLogPath))
    return res.status(404).json({ message: "No anchors found." });

  const anchors = JSON.parse(fs.readFileSync(anchorLogPath));
  const index = anchors.findIndex((a) => a.cid === cid);

  if (index === -1) {
    return res.status(404).json({ message: `CID ${cid} not found.` });
  }

  anchors[index].flags = (anchors[index].flags || 0) + 1;
  fs.writeFileSync(anchorLogPath, JSON.stringify(anchors, null, 2));

  res
    .status(200)
    .json({ message: "Flag recorded.", total_flags: anchors[index].flags });
});
// POST /profile - submit or update a profile
app.post("/profile", (req, res) => {
  console.log("🧾 Received profile submission:", req.body);
  const { public_key, username, bio, verification_level, kaspa_address } =
    req.body;

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
    return res
      .status(400)
      .json({ message: "❌ Missing or invalid profile fields." });
  }

  const profileFile = path.join(__dirname, "profiles.json");

  let profiles = [];

  if (fs.existsSync(profileFile)) {
    profiles = JSON.parse(fs.readFileSync(profileFile));
  }

  const index = profiles.findIndex((p) => p.public_key === public_key);

  const profile = {
    public_key,
    username,
    bio,
    verification_level,
    kaspa_address,
    updated_at: new Date().toISOString(),
  };

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  console.log("📁 Writing profiles:", profiles);

  fs.writeFileSync(profileFile, JSON.stringify(profiles, null, 2));
  res.status(200).json({ message: "✅ Profile saved", profile });
});
// GET /profile/:publicKey - fetch a profile
app.get("/profile/:publicKey", (req, res) => {
  const publicKey = req.params.publicKey;
  const profileFile = "profiles.json";

  if (!fs.existsSync(profileFile)) {
    return res.status(404).json({ message: "No profiles found." });
  }

  const profiles = JSON.parse(fs.readFileSync(profileFile));
  const profile = profiles.find((p) => p.public_key === publicKey);

  if (!profile) {
    return res
      .status(404)
      .json({ message: `Profile for ${publicKey} not found.` });
  }

  res.status(200).json({ profile });
});
// Start the server
app.listen(port, () => {
  console.log(`✅ Flux-sim backend running at http://localhost:${port}`);
});
