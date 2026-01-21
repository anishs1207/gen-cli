#!/usr/bin/env bash
set -e

BIN_DIR="$HOME/bin"
TARGET="$BIN_DIR/gen"

echo "🔧 Installing gen CLI..."

# 1. Create bin directory
mkdir -p "$BIN_DIR"

# 2. Copy CLI
cp gen "$TARGET"

# 3. Make executable
chmod +x "$TARGET"

# 4. Ensure PATH contains ~/bin
SHELL_RC="$HOME/.bashrc"
if [ -n "$ZSH_VERSION" ]; then
  SHELL_RC="$HOME/.zshrc"
fi

if ! echo "$PATH" | grep -q "$BIN_DIR"; then
  echo 'export PATH="$HOME/bin:$PATH"' >> "$SHELL_RC"
  echo "✅ Added ~/bin to PATH in $SHELL_RC (restart terminal)"
else
  echo "ℹ️  ~/bin already in PATH"
fi

echo "🎉 gen CLI installed successfully!"
echo "➡️  Run: gen <prompt>"
echo "➡️  Or change API key anytime with: gen change-api"
