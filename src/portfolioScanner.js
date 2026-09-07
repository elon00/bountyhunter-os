/**
 * Portfolio Reality Scanner
 * Discovers and audits verified repositories in the user workspace.
 */

import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from '@noble/hashes/sha256';

export const REPOSITORY_MANIFEST = [
  { name: 'jarsol-web4-automaton', path: 'C:/Users/marti/OneDrive/Desktop/Jarvis', branch: 'main' },
  { name: 'QARBI', path: 'C:/Users/marti/QARBI', branch: 'main' },
  { name: 'sui.pqc', path: 'C:/Users/marti/sui.pqc', branch: 'main' },
  { name: 'pq-rdl-blockchain', path: 'C:/Users/marti/pq-rdl-blockchain', branch: 'master' },
  { name: 'quantumshield', path: 'C:/Users/marti/quantumshield', branch: 'master' },
  { name: 'martins-algorithm', path: 'C:/Users/marti/martins-algorithm', branch: 'main' },
  { name: 'solana-pqc', path: 'C:/Users/marti/solana-pqc', branch: 'master' },
  { name: 'shor-x402', path: 'C:/Users/marti/shor-x402', branch: 'main' },
  { name: 'bountyhunter-os', path: 'C:/Users/marti/bountyhunter-os', branch: 'main' }
];

export function scanPortfolioStatus() {
  const results = [];

  for (const repo of REPOSITORY_MANIFEST) {
    const certPath = path.join(repo.path, 'reality', 'URS_EVIDENCE_CERTIFICATE.json');
    let hasCertificate = false;
    let certData = null;

    if (fs.existsSync(certPath)) {
      try {
        certData = JSON.parse(fs.readFileSync(certPath, 'utf-8'));
        hasCertificate = true;
      } catch (e) {
        // invalid JSON
      }
    }

    results.push({
      name: repo.name,
      path: repo.path,
      branch: repo.branch,
      hasCertificate,
      masterHash: certData?.masterHash || 'UNSEALED',
      weakestLinkScore: certData?.weakestLinkScore ?? 6.0,
      status: certData?.status || (hasCertificate ? 'CERTIFIED' : 'READY_TO_SEAL'),
      pqcCertified: Boolean(certData?.certificateSignature)
    });
  }

  return results;
}
