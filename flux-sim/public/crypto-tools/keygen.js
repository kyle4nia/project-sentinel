const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate key pair
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log("📣 Your new key pair:");
console.log("🔐 Private Key:", privateKey);
console.log("🪪 Public Key:", publicKey);
