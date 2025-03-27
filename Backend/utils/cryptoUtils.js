// utils/cryptoUtils.js
const { ec: EC } = require("elliptic");
const ec = new EC("secp256k1");

function verifySignature(publicKey, msgHash, signature) {
  const key = ec.keyFromPublic(publicKey, "hex");
  return key.verify(msgHash, Buffer.from(signature, "hex"));
}

module.exports = {
  verifySignature,
};
