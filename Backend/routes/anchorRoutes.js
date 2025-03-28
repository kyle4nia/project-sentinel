const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { ec: EC } = require("elliptic");
const ec = new EC("secp256k1");

const anchorFilePath = path.join(__dirname, "../Data/anchored-cids.json");

function readAnchors() {
  try {
    const data = fs.readFileSync(anchorFilePath);
    return JSON.parse(data);
  } catch {
    return { anchors: [] };
  }
}

function writeAnchors(data) {
  fs.writeFileSync(anchorFilePath, JSON.stringify(data, null, 2));
}

router.post("/anchor", (req, res) => {
  const { cid, note, signed_by, signature } = req.body;

  if (!cid || typeof cid !== "string") {
    return res.status(400).json({ error: "Invalid CID." });
  }
  if (!signed_by || typeof signed_by !== "string" || !signed_by.startsWith("04") || signed_by.length !== 130) {
    return res.status(400).json({ error: "Invalid public key." });
  }
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Signature missing." });
  }

  const message = cid + (note || "");
  const msgHash = crypto.createHash("sha256").update(message).digest();

  let is_valid = false;
  try {
    const key = ec.keyFromPublic(signed_by, "hex");
    is_valid = key.verify(msgHash, signature);
  } catch (err) {
    return res.status(400).json({ error: "Signature verification failed." });
  }

  const anchors = readAnchors();
  if (anchors.anchors.find((a) => a.cid === cid)) {
    return res.status(409).json({ error: "CID already anchored." });
  }

  const timestamp = Date.now();
  anchors.anchors.push({ cid, note, signed_by, signature, is_valid, votes: 0, flags: 0, timestamp });
  writeAnchors(anchors);

  res.json({ success: true, anchor: { cid, is_valid } });
});

router.get("/anchors", (_, res) => {
  res.json(readAnchors());
});

module.exports = router;
