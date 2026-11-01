# Mission-control security review

## Source fingerprint race

Path existence checks before reading missed dangling symlinks and allowed a file replacement between inspection and read. The reader now hashes link targets directly, opens regular files without a prior stat check, reads through the open descriptor, and verifies descriptor/file identity and timestamps afterward. A changing input blocks the result. Regressions cover replacement during opening and dangling-link retargeting.

These checks establish local content identity during a check run. They do not sandbox arbitrary repository code or constitute an independent security audit.

## RPC observations written as JSON

CodeQL's `js/http-to-file-access` finding identifies intentional persistence of a read-only RPC observation. The remote endpoint cannot choose the output path. Expected chain, transaction and contract identity come from local explicit inputs; RPC quantities must be canonical hexadecimal strings, hashes/bytecode have strict formats, and bytecode is stored only as a SHA-256 digest. Remote error text and endpoint credentials are not persisted. Output is JSON data, never loaded as executable code or treated as source/deployment certification. Non-JSON output filenames are rejected.

The intended-data-writing flow must be reviewed and recorded as such rather than disabling CodeQL. A malicious remote proof still cannot award the source-match, testnet-product or mainnet-release criteria. Tests reject JSON values that merely coerce into expected strings and reject executable output paths. The observation remains a single-provider claim with source match explicitly NOT_VERIFIED.

## Hosting initialization

The committed Netlify configuration began with UTF-8 bytes EF BB BF. Strict TOML parsing reproduced an initialization failure at its first character. Remove that byte-order mark while preserving the application's actual Node 22 build configuration, then validate strict parsing, the real build command and repository-contained publish path in CI. Local parsing success is separate from a completed hosted deployment.

## Portfolio input integrity

Audit and current IDs are normalized positive integers before duplicate detection. Prior source and deployment records require immutable repository IDs so renames and old-name reuse cannot transfer evidence to a different project. Missing/invalid fork flags fail closed. Push timestamps are activity hints; current source identity remains unresolved until the current head is actually read. Provenance hashes cover exactly the same captured bytes that were parsed.
