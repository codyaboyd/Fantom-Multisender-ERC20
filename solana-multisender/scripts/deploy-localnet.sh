#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Building Anchor program..."
anchor build

echo "Deploying to currently configured cluster in Anchor.toml..."
anchor deploy

echo "Done."
