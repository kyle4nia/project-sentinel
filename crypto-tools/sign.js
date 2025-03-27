const EC = require("elliptic").ec;
const crypto = require("crypto");
const ec = new EC("secp256k1");

// 🔐 Replace with your actual private key
const privateKey =
  "c10787244e1d5d80f5d15746e88dd9c2e0d17b1712191acaa8200b8fc708f9b6";
const key = ec.keyFromPrivate(privateKey);

// 🛠 Accept command line arguments
const [cid, ...noteParts] = process.argv.slice(2);
const note = noteParts.join(" ") || "Proof of trust from Project Sentinel";

if (!cid) {
  console.error("❌ Usage: node sign.js <cid> [note]");
  process.exit(1);
}

const message = cid + note;
const msgHash = crypto.createHash("sha256").update(message).digest();
const signature = key.sign(msgHash).toDER("hex");

console.log("🔑 CID:", cid);
console.log("📝 Note:", note);
console.log("🔏 Signed By (Public Key):", key.getPublic("hex"));
console.log("✍️ Signature:", signature);
console.log("🔍 Backend message:", message);
console.log("🔍 Backend hash:", msgHash.toString("hex"));

console.log(
  "\n📦 JSON for Submission:\n",
  JSON.stringify(
    {
      cid,
      note,
      signed_by: key.getPublic("hex"),
      signature,
    },
    null,
    2
  )
);
