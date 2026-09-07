/**
 * BountyHunter OS / QMoosa Master Operating System
 * Post-Quantum Cryptographic Engine (Pure TypeScript / JavaScript)
 * Implements NIST FIPS 203 (ML-KEM-768) and NIST FIPS 204 (ML-DSA-65)
 */

import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { sha256 } from '@noble/hashes/sha256.js';
import { hkdf } from '@noble/hashes/hkdf.js';

export const PQC_CONSTANTS = Object.freeze({
  ML_KEM_768_PUBLIC_KEY_BYTES: 1184,
  ML_KEM_768_SECRET_KEY_BYTES: 2400,
  ML_KEM_768_CIPHERTEXT_BYTES: 1088,
  ML_KEM_768_SHARED_SECRET_BYTES: 32,
  ML_DSA_65_PUBLIC_KEY_BYTES: 1952,
  ML_DSA_65_SECRET_KEY_BYTES: 4032,
  ML_DSA_65_SIGNATURE_BYTES: 3309,
});

export function generatePqcKeypair(seed) {
  let dsaSeed;
  let kemSeed;
  if (seed) {
    const raw = seed instanceof Uint8Array ? seed : new Uint8Array(seed);
    dsaSeed = sha256(raw); // exact 32 bytes for ML-DSA-65
    const h1 = sha256(raw);
    const appended = new Uint8Array(raw.length + 1);
    appended.set(raw, 0);
    appended[raw.length] = 0x01;
    const h2 = sha256(appended);
    kemSeed = new Uint8Array(64); // exact 64 bytes for ML-KEM-768
    kemSeed.set(h1, 0);
    kemSeed.set(h2, 32);
  }
  const dsaKeys = dsaSeed ? ml_dsa65.keygen(dsaSeed) : ml_dsa65.keygen();
  const kemKeys = kemSeed ? ml_kem768.keygen(kemSeed) : ml_kem768.keygen();
  return {
    dsaPublicKey: dsaKeys.publicKey,
    dsaSecretKey: dsaKeys.secretKey,
    kemPublicKey: kemKeys.publicKey,
    kemSecretKey: kemKeys.secretKey,
  };
}

export function signAuditReport(reportBytes, dsaSecretKey) {
  const digest = sha256(reportBytes);
  const signature = ml_dsa65.sign(reportBytes, dsaSecretKey);
  return {
    digestHex: Buffer.from(digest).toString('hex'),
    signatureHex: Buffer.from(signature).toString('hex'),
  };
}

export function verifyAuditReport(reportBytes, signatureBytes, dsaPublicKey) {
  if (!signatureBytes || signatureBytes.length !== PQC_CONSTANTS.ML_DSA_65_SIGNATURE_BYTES) {
    return false;
  }
  if (!dsaPublicKey || dsaPublicKey.length !== PQC_CONSTANTS.ML_DSA_65_PUBLIC_KEY_BYTES) {
    return false;
  }
  return ml_dsa65.verify(signatureBytes, reportBytes, dsaPublicKey);
}

export function encapsulateSessionKey(peerKemPublicKey) {
  if (!peerKemPublicKey || peerKemPublicKey.length !== PQC_CONSTANTS.ML_KEM_768_PUBLIC_KEY_BYTES) {
    throw new Error('Invalid peer KEM public key length');
  }
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(peerKemPublicKey);
  return { cipherText, sharedSecret };
}

export function decapsulateSessionKey(cipherText, kemSecretKey) {
  if (!cipherText || cipherText.length !== PQC_CONSTANTS.ML_KEM_768_CIPHERTEXT_BYTES) {
    throw new Error('Invalid KEM ciphertext length');
  }
  return ml_kem768.decapsulate(cipherText, kemSecretKey);
}

export function deriveMasterRealityKey(sharedSecret, salt, info) {
  return hkdf(sha256, sharedSecret, salt, info, 32);
}
