const { ec: EC } = require('elliptic');
const crypto = require('crypto');
const readline = require('readline');

// Setup readline prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for private key
rl.question('🔑 Enter your private key (hex): ', (privateKeyHex) => {
  try {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPrivate(privateKeyHex.trim());

    // Prompt for CID and Note
    rl.question('🆔 Enter CID: ', (cid) => {
      rl.question('📝 Enter Note: ', (note) => {
        const message = cid + note;
        const msgHash = crypto.createHash('sha256').update(message).digest();
        const signature = key.sign(msgHash);
        const derSignature = signature.toDER('hex');

        console.log('\n🔏 Signature:', derSignature);
        rl.close();
      });
    });
  } catch (err) {
    console.error('❌ Invalid key or input error:', err.message);
    rl.close();
  }
});
