const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const anchorFilePath = path.join(__dirname, "../Data/anchored-cids.json");

function readAnchors() {
  try {
    return JSON.parse(fs.readFileSync(anchorFilePath));
  } catch {
    return { anchors: [] };
  }
}

function writeAnchors(data) {
  fs.writeFileSync(anchorFilePath, JSON.stringify(data, null, 2));
}

function updateAnchorField(cid, field) {
  const anchors = readAnchors();
  const anchor = anchors.anchors.find((a) => a.cid === cid);
  if (!anchor) return null;

  anchor[field] = (anchor[field] || 0) + 1;
  writeAnchors(anchors);
  return anchor;
}

router.post("/vote", (req, res) => {
  const { cid } = req.body;
  const updated = updateAnchorField(cid, "votes");
  if (!updated) {
    return res.status(404).json({ error: "Anchor not found." });
  }
  res.json({ success: true, anchor: updated });
});

router.post("/flag", (req, res) => {
  const { cid } = req.body;
  const updated = updateAnchorField(cid, "flags");
  if (!updated) {
    return res.status(404).json({ error: "Anchor not found." });
  }
  res.json({ success: true, anchor: updated });
});

module.exports = router;
