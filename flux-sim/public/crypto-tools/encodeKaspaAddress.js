// encodeKaspaAddress.js (Browser-Compatible)

import { blake2b } from "https://cdn.jsdelivr.net/npm/blakejs@1.1.0/+esm";

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}

function toBase58(uint8Array) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let x = BigInt(
    "0x" +
      Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
  );
  let result = "";
  while (x > 0) {
    const mod = x % 58n;
    result = alphabet[mod] + result;
    x = x / 58n;
  }
  for (let i = 0; i < uint8Array.length && uint8Array[i] === 0; i++) {
    result = "1" + result;
  }
  return result;
}

export function encodeKaspaAddress(publicKeyHex) {
  const publicKey = hexToBytes(publicKeyHex);
  const hash = blake2b(publicKey, null, 32);
  const prefix = new Uint8Array([0x08, 0x01]); // kaspa mainnet prefix
  const body = new Uint8Array(prefix.length + hash.length);
  body.set(prefix);
  body.set(hash, prefix.length);
  return "kaspa:" + toBase58(body);
}
