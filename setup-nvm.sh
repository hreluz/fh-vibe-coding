#!/usr/bin/env bash
# Installs (if needed) and switches to the Node version pinned below.
# Keep this in sync with nvm-vibe-coding.txt.
#
# Usage: this script calls `nvm use`, which only changes the Node version of
# the CURRENT shell when the script is sourced, not executed as a subprocess.
# Run it as:
#   source setup-nvm.sh
# or:
#   . setup-nvm.sh

NODE_VERSION="v24.18.1"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  \. "$NVM_DIR/nvm.sh"
else
  echo "setup-nvm.sh: nvm not found at $NVM_DIR. Install nvm first: https://github.com/nvm-sh/nvm" >&2
  return 1 2>/dev/null || exit 1
fi

if ! nvm list "$NODE_VERSION" >/dev/null 2>&1; then
  echo "setup-nvm.sh: installing Node $NODE_VERSION..."
  nvm install "$NODE_VERSION"
fi

nvm use "$NODE_VERSION"

# Warn if this script was executed rather than sourced (Node version won't
# persist in the caller's shell in that case). `return` only succeeds here
# when the script is sourced.
if ! (return 0 2>/dev/null); then
  echo "setup-nvm.sh: note — run with 'source setup-nvm.sh' for the Node version to apply to your shell." >&2
fi
