// routes/voteRoutes.js
const express = require("express");
const router = express.Router();
const { readAnchors, writeAnchors } = require("../utils/dataStore");

const anchorLogPath = "anchored-cids.json";

// POST /vote - Upvote a CID
router.post("/vote", async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return res.status(400).json({ message: "CID is required." });
    let anchors = await readAnchors(anchorLogPath);
    const index = anchors.findIndex(a => a.cid === cid);
    if (index === -1) {
      return res.status(404).json({ message: `CID ${cid} not found.` });
    }
    anchors[index].votes = (anchors[index].votes || 0) + 1;
    await writeAnchors(anchorLogPath, anchors);
    res.status(200).json({ message: "Vote recorded.", total_votes: anchors[index].votes });
  } catch (err) {
    console.error("Error in POST /vote:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /flag - Flag a CID
router.post("/flag", async (req, res) => {
  try {
    const { cid } = req.body;
    if (!cid) return res.status(400).json({ message: "CID is required." });
    let anchors = await readAnchors(anchorLogPath);
    const index = anchors.findIndex(a => a.cid === cid);
    if (index === -1) {
      return res.status(404).json({ message: `CID ${cid} not found.` });
    }
    anchors[index].flags = (anchors[index].flags || 0) + 1;
    await writeAnchors(anchorLogPath, anchors);
    res.status(200).json({ message: "Flag recorded.", total_flags: anchors[index].flags });
  } catch (err) {
    console.error("Error in POST /flag:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
