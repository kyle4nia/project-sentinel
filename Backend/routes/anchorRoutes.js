// routes/anchorRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { verifySignature } = require("../utils/cryptoUtils");
const { readAnchors, writeAnchors } = require("../utils/dataStore");

const anchorLogPath = "anchored-cids.json";

// POST /anchor - Submit a signed CID
router.post("/anchor", async (req, res) => {
  try {
    const { cid, note, signed_by, signature } = req.body;
    if (!cid) {
      return res.status(400).json({ message: "CID is required." });
    }

    // Compose message and hash it
    const message = cid + (note || "");
    const msgHash = crypto.createHash("sha256").update(message).digest();
    console.log("🔍 Backend message:", message);
    console.log("🔍 Backend hash:", msgHash.toString("hex"));

    // Verify signature using our utility
    let is_valid = false;
    try {
      is_valid = verifySignature(signed_by, msgHash, signature);
      console.log("✅ Signature valid?", is_valid);
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
      votes: 0,
      flags: 0
    };

    let anchors = await readAnchors(anchorLogPath);
    anchors.push(anchor);
    await writeAnchors(anchorLogPath, anchors);

    res.status(201).json({ message: "CID anchored", anchor });
  } catch (err) {
    console.error("Error in /anchor:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /anchors - Retrieve all anchors
router.get("/anchors", async (req, res) => {
  try {
    let anchors = await readAnchors(anchorLogPath);
    if (!anchors || anchors.length === 0) {
      return res.status(404).json({ message: "No anchors found yet." });
    }
    res.status(200).json({ anchors });
  } catch (err) {
    console.error("Error in GET /anchors:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /anchor/:cid - Retrieve a specific anchor by CID
router.get("/anchor/:cid", async (req, res) => {
  try {
    const cidToFind = req.params.cid;
    let anchors = await readAnchors(anchorLogPath);
    const match = anchors.find(a => a.cid === cidToFind);
    if (!match) {
      return res.status(404).json({ message: `CID ${cidToFind} not found.` });
    }
    res.status(200).json({ anchor: match });
  } catch (err) {
    console.error("Error in GET /anchor/:cid", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
