/**
 * x402 Mesh Client & Synchronizer
 * Enables autonomous agents to discover services, negotiate HTTP 402 challenges,
 * and settle payments across Solana, Arbitrum, Sui, and Algorand.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class X402MeshClient {
  constructor(configPath = path.join(__dirname, '..', 'config', 'x402-mesh-sync.json')) {
    this.configPath = configPath;
    this.mesh = this.loadMesh();
  }

  loadMesh() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Mesh configuration not found at ${this.configPath}`);
    }
    return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
  }

  listNodes() {
    return this.mesh.nodes || [];
  }

  getNode(nodeId) {
    return (this.mesh.nodes || []).find((n) => n.id === nodeId);
  }

  /**
   * Performs an autonomous discovery call to a node's x402 Bazaar manifest.
   */
  async discoverNode(nodeId, localPortMapping = {}) {
    const node = this.getNode(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found in mesh.`);

    const targetUrl = localPortMapping[nodeId]
      ? `${localPortMapping[nodeId]}/.well-known/x402-bazaar.json`
      : node.bazaarUrl;

    try {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        id: node.id,
        status: 'UNREACHABLE_OR_OFFLINE',
        cachedManifest: node,
        error: err.message
      };
    }
  }

  /**
   * Evaluates an HTTP 402 challenge response from an agent endpoint.
   */
  parse402Challenge(headers, body) {
    const authHeader = headers['www-authenticate'] || headers.get?.('www-authenticate') || '';
    return {
      protocol: 'x402',
      challengeHeader: authHeader,
      body: body || null,
      isPaymentRequired: Boolean(authHeader.toLowerCase().includes('x402'))
    };
  }
}
