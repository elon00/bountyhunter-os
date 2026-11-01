"""Validate the real Netlify config and its build paths before a hosting attempt. Python 3.11+."""
import json
from pathlib import Path
import tomllib

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / "netlify.toml").read_bytes()
# Deliberately use strict UTF-8: a BOM broke Netlify's TOML initialization.
config = tomllib.loads(raw.decode("utf-8"))
build = config["build"]
base = (ROOT / build.get("base", ".")).resolve()
publish = (base / build["publish"]).resolve()
if not base.is_relative_to(ROOT) or not publish.is_relative_to(ROOT) or not base.is_dir():
    raise ValueError("Hosting paths must stay inside the repository")
package = json.loads((base / "package.json").read_text(encoding="utf-8"))
if build["command"] != "npm run build" or not package.get("scripts", {}).get("build"):
    raise ValueError("Hosting must invoke the application's actual build script")
print("PASS: strict TOML parsing, application build command and repository-contained publish path")
