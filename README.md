# gen CLI

`gen` is a command-line tool that generates shell commands (and optionally executes them) using the Gemini API.

This guide will help you install, configure, and use `gen` on your system.

---

## Prerequisites

Before installing, make sure you have:

- **Linux/macOS** or **Windows with WSL**
- **Bash shell**
- **curl** (for API requests)
- **jq** (optional, for parsing responses; otherwise `sed` fallback is used)

Check your environment:

```bash
bash --version
curl --version
jq --version  # optional
```

## Installation

Clone the repository:

```bash
git clone https://github.com/anishs1207/gen-cli.git
cd gen-cli
```

Make the install script executable:

```bash
chmod +x install.sh
```

Run the installation script:

```bash
./install.sh
```

This script will:

1. Copy `gen` to `~/bin`
2. Make it executable
3. Add `~/bin` to your PATH (if not already present)

You should see:

> 🎉 gen CLI installed successfully!
> ➡️  Run: gen <prompt>
> ➡️  Or change API key anytime with: gen change-api

**Tip:** Restart your terminal to apply PATH changes.

## Setting GEMINI API Key

`gen` requires a Gemini API key to work. You can set it in two ways:

### 1. During first run

The first time you run `gen`, it will prompt:

```text
Enter your GEMINI API Key:
```

The key will be saved in your shell configuration (`.bashrc` or `.zshrc`).

### 2. Change API key anytime

```bash
gen change-api
```

This will prompt you to enter a new API key and update it in your shell configuration.

## Usage

Basic usage:

```bash
gen <prompt>
```

### Usage Examples

**File Operations**

```bash
# Create a directory
gen create a folder named 'src'

# Find files
gen find all python files in the current directory

# Archive files
gen compress the logs folder into logs.tar.gz
```

**System Administration**

```bash
# Kill a process
gen kill the process running on port 3000

# Check resources
gen show disk usage for the current directory
```

**Git Operations**

```bash
# Git history
gen show git log as a graph

# Undo changes
gen soft reset to previous commit
```

**Networking**

```bash
# Check IP
gen what is my public IP address
```

`gen` will output a shell command and ask if you want to execute it.

You can also run without execution:

```bash
gen <prompt>
```

or force execution:

```bash
gen <prompt>  # then type 'y' when prompted
```

## Troubleshooting

- **Command not found**: Make sure `~/bin` is in your `PATH`.
- **Permission denied**: Run `chmod +x ~/bin/gen`.
- **API key issues**: Ensure `GEMINI_API_KEY` is set in your shell (`echo $GEMINI_API_KEY`).

## Uninstallation

To remove `gen`:

```bash
rm ~/bin/gen
```

Optionally, remove the API key from your shell config:

```bash
# Edit ~/.bashrc or ~/.zshrc and remove the GEMINI_API_KEY line
```

## Notes

- For best experience, install `jq` to properly parse Gemini responses.
- `gen` will attempt to execute the generated command only after your confirmation.
- Keep your GEMINI API key secure—do not share it publicly.