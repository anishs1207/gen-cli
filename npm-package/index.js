#!/usr/bin/env node
import { execSync } from "child_process";
import readline from "readline";
import fs from "fs";
import os from "os";
import path from "path";
import fetch from "node-fetch";

// ------------------ OS & SHELL DETECTION ------------------
const isWindows = os.platform() === "win32";
const isGitBash = Boolean(process.env.MINGW_PREFIX || process.env.MSYSTEM);
const isWSL = Boolean(process.env.WSL_DISTRO_NAME);

// Detect shell rc file (macOS / Linux only)
const SHELL_RC = process.env.ZSH_VERSION
  ? path.join(os.homedir(), ".zshrc")
  : path.join(os.homedir(), ".bashrc");

// ------------------ HELPERS ------------------
const ask = (q) =>
  new Promise((res) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(q, (a) => {
      rl.close();
      res(a.trim());
    });
  });

const readKeyFromRC = () => {
  if (isWindows || !fs.existsSync(SHELL_RC)) return null;
  const content = fs.readFileSync(SHELL_RC, "utf8");
  const match = content.match(/^export GEMINI_API_KEY=(.+)$/m);
  return match ? match[1].replace(/^['"]|['"]$/g, "").trim() : null;
};

const saveKeyToRC = (key) => {
  if (isWindows) return; // Windows users should use env vars

  let content = fs.existsSync(SHELL_RC)
    ? fs.readFileSync(SHELL_RC, "utf8")
    : "";

  content = content
    .split("\n")
    .filter((l) => !l.includes("GEMINI_API_KEY"))
    .join("\n");

  fs.writeFileSync(
    SHELL_RC,
    content + `\nexport GEMINI_API_KEY="${key}"\n`
  );
};

// Clean markdown / backticks from Gemini output
const cleanCommand = (cmd) =>
  cmd
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/g, "")
    .replace(/^`|`$/g, "")
    .trim();

// Convert bash → Windows cmd ONLY if not using Git Bash or WSL
const normalizeCommand = (cmd) => {
  if (isGitBash || isWSL || !isWindows) return cmd;

  return cmd
    .replace(/^ls\b/g, "dir")
    .replace(/^cat\b/g, "type")
    .replace(/^rm\b/g, "del")
    .replace(/^cp\b/g, "copy")
    .replace(/^mv\b/g, "move");
};

// ------------------ API KEY ------------------
let GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || readKeyFromRC();

if (!GEMINI_API_KEY) {
  console.log("🔑 GEMINI_API_KEY not found.");
  GEMINI_API_KEY = await ask("Enter your GEMINI API Key: ");

  if (!GEMINI_API_KEY) {
    console.error("❌ API key is required.");
    process.exit(1);
  }

  saveKeyToRC(GEMINI_API_KEY);
  console.log("✅ API key saved");
}

// ------------------ CLI ARGS ------------------
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: gn <prompt>");
  console.log("       gn change-api");
  process.exit(1);
}

if (args[0] === "change-api") {
  const key = await ask("Enter new GEMINI API Key: ");
  saveKeyToRC(key);
  console.log("✅ API key updated. Restart terminal to apply globally.");
  process.exit(0);
}

// ------------------ GEMINI ------------------
const USER_PROMPT = args.join(" ");

const SYSTEM_PROMPT = `
You are a shell command generator.

Rules:
- Return ONLY the raw command.
- NO backticks, NO markdown, NO explanations.
- Windows → cmd.exe commands if NOT Git Bash / WSL.
- macOS/Linux → bash commands (ls, cat, cp)
- Single command only.
`.trim();

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "x-goog-api-key": GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${USER_PROMPT}` }] }],
    }),
  }
);

const json = await response.json();
let output = json?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!output) {
  console.error("❌ Gemini error:", JSON.stringify(json, null, 2));
  process.exit(1);
}

// ------------------ EXECUTION ------------------
const cleaned = cleanCommand(output);
const finalCommand = normalizeCommand(cleaned);

console.log(`\n$ ${finalCommand}`);

// Choose shell
let shellToUse;
if (isGitBash) {
  shellToUse = "bash"; // assumes Git Bash is in PATH
} else if (isWSL) {
  shellToUse = "wsl.exe";
} else if (isWindows) {
  shellToUse = "cmd.exe";
}

const run = await ask("Run this command? [y/N]: ");
if (/^y$/i.test(run)) {
  execSync(finalCommand, {
    stdio: "inherit",
    shell: shellToUse,
  });
} else {
  console.log("⚠ Command not executed.");
}
