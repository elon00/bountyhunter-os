import test from 'node:test';
import assert from 'node:assert/strict';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha256.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import {
  PQC_CONSTANTS,
  generatePqcKeypair,
  signAuditReport,
  verifyAuditReport,
  encapsulateSessionKey,
  decapsulateSessionKey,
  deriveMasterRealityKey
} from '../src/pqcEngine.js';

test('NIST TIER 1: RFC 5869 HKDF-SHA256 Known Answer Verification', () => {
  const ikm = new Uint8Array(22).fill(0x0b);
  const salt = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c]);
  const info = new Uint8Array([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9]);
  const expectedOkm = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';
  const okm = Buffer.from(hkdf(sha256, ikm, salt, info, 42)).toString('hex');
  assert.equal(okm, expectedOkm, 'RFC 5869 OKM must match byte-for-byte');
});

test('NIST TIER 2: Canonical SHA-256 State Invariants', () => {
  const emptyHash = Buffer.from(sha256(new Uint8Array(0))).toString('hex');
  assert.equal(emptyHash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const osRoot = Buffer.from(sha256(Buffer.from('BountyHunter OS Reality Root'))).toString('hex');
  assert.equal(osRoot.length, 64);
});

test('NIST TIER 3: NIST FIPS 203 ML-KEM-768 Wire Invariants & Decap', () => {
  const seed = new Uint8Array(64).fill(0x42);
  const keys = generatePqcKeypair(seed);
  assert.equal(keys.kemPublicKey.length, PQC_CONSTANTS.ML_KEM_768_PUBLIC_KEY_BYTES);
  assert.equal(keys.kemSecretKey.length, PQC_CONSTANTS.ML_KEM_768_SECRET_KEY_BYTES);

  const { cipherText, sharedSecret } = encapsulateSessionKey(keys.kemPublicKey);
  assert.equal(cipherText.length, PQC_CONSTANTS.ML_KEM_768_CIPHERTEXT_BYTES);
  assert.equal(sharedSecret.length, PQC_CONSTANTS.ML_KEM_768_SHARED_SECRET_BYTES);

  const recoveredSecret = decapsulateSessionKey(cipherText, keys.kemSecretKey);
  assert.deepEqual(Buffer.from(sharedSecret), Buffer.from(recoveredSecret));
});

test('NIST TIER 4: NIST FIPS 203 §7.3 Implicit Rejection', () => {
  const seed = new Uint8Array(64).fill(0x33);
  const keys = generatePqcKeypair(seed);
  const { cipherText, sharedSecret } = encapsulateSessionKey(keys.kemPublicKey);

  const corruptedCT = new Uint8Array(cipherText);
  corruptedCT[12] ^= 0xff;

  const implicitKey = decapsulateSessionKey(corruptedCT, keys.kemSecretKey);
  assert.equal(implicitKey.length, 32);
  assert.notDeepEqual(Buffer.from(implicitKey), Buffer.from(sharedSecret));
});

test('NIST TIER 5: NIST FIPS 204 ML-DSA-65 Wire Invariants', () => {
  const seed = new Uint8Array(32).fill(0x77);
  const keys = generatePqcKeypair(seed);
  assert.equal(keys.dsaPublicKey.length, PQC_CONSTANTS.ML_DSA_65_PUBLIC_KEY_BYTES);
  assert.equal(keys.dsaSecretKey.length, PQC_CONSTANTS.ML_DSA_65_SECRET_KEY_BYTES);
});

test('NIST TIER 6: NIST FIPS 204 ML-DSA-65 Signing & Verification', () => {
  const keys = generatePqcKeypair();
  const testPayload = Buffer.from('BOUNTYHUNTER_OS_REALITY_AUDIT_REPORT_V1');
  const { digestHex, signatureHex } = signAuditReport(testPayload, keys.dsaSecretKey);

  assert.equal(signatureHex.length / 2, PQC_CONSTANTS.ML_DSA_65_SIGNATURE_BYTES);
  const valid = verifyAuditReport(testPayload, Buffer.from(signatureHex, 'hex'), keys.dsaPublicKey);
  assert.equal(valid, true);
});

test('NIST TIER 7: Wycheproof Negative & Adversarial Tests', () => {
  const keys = generatePqcKeypair();
  const testPayload = Buffer.from('BOUNTYHUNTER_OS_TEST_PAYLOAD');
  const { signatureHex } = signAuditReport(testPayload, keys.dsaSecretKey);
  const sigBytes = Buffer.from(signatureHex, 'hex');

  // Mutation: flip single bit
  sigBytes[50] ^= 0x01;
  const invalidMutated = verifyAuditReport(testPayload, sigBytes, keys.dsaPublicKey);
  assert.equal(invalidMutated, false);

  // Mutation: altered payload
  const alteredPayload = Buffer.from('BOUNTYHUNTER_OS_ALTERED_PAYLOAD');
  const invalidAltered = verifyAuditReport(alteredPayload, Buffer.from(signatureHex, 'hex'), keys.dsaPublicKey);
  assert.equal(invalidAltered, false);
});

test('NIST TIER 8: Post-Quantum Master Reality Key Derivation', () => {
  const seed = new Uint8Array(64).fill(0x99);
  const keys = generatePqcKeypair(seed);
  const { sharedSecret } = encapsulateSessionKey(keys.kemPublicKey);
  const masterKey = deriveMasterRealityKey(sharedSecret, Buffer.from('BOUNTYHUNTER_SALT'), Buffer.from('REALITY_ENGINE'));
  assert.equal(masterKey.length, 32);
});
