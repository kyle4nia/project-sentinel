export function encodeKaspaAddress(publicKeyHex) {
  // Convert hex to bytes
  const hexToBytes = hex =>
    new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const publicKeyBytes = hexToBytes(publicKeyHex);

  // Add network prefix: 0x08 (mainnet, P2PK)
  const prefix = Uint8Array.from([0x08]);

  // Concatenate prefix + pubkey
  const prefixed = new Uint8Array(prefix.length + publicKeyBytes.length);
  prefixed.set(prefix);
  prefixed.set(publicKeyBytes, prefix.length);

  // SHA-256 hash
  const sha256 = async (message) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', message);
    return new Uint8Array(hashBuffer);
  };

  // Calculate checksum (first 4 bytes of double SHA-256)
  return sha256(prefixed).then(firstHash =>
    sha256(firstHash).then(secondHash => {
      const checksum = secondHash.slice(0, 4);
      const finalBytes = new Uint8Array(prefixed.length + checksum.length);
      finalBytes.set(prefixed);
      finalBytes.set(checksum, prefixed.length);

      // Base58 encoding
      return base58Encode(finalBytes);
    })
  );
}

// Base58 implementation
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(buffer) {
  let x = BigInt('0x' + [...buffer].map(b => b.toString(16).padStart(2, '0')).join(''));
  const base = BigInt(alphabet.length);
  let result = '';
  while (x > 0n) {
    result = alphabet[x % base] + result;
    x = x / base;
  }
  // Add '1' for each leading 0 byte
  for (let b of buffer) {
    if (b === 0) result = '1' + result;
    else break;
  }
  return 'kaspa:' + result;
}
