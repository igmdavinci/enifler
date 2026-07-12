const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const serverPath = join(root, "server.py");

if (!existsSync(serverPath)) {
  console.error("Não encontrei o server.py na raiz do projeto.");
  process.exit(1);
}

const candidates = process.platform === "win32"
  ? [
      { command: "py", args: [serverPath] },
      { command: "python", args: [serverPath] }
    ]
  : [
      { command: "python3", args: [serverPath] },
      { command: "python", args: [serverPath] }
    ];

function start(index = 0) {
  const candidate = candidates[index];
  if (!candidate) {
    console.error("Não consegui encontrar Python instalado para subir a loja.");
    process.exit(1);
  }

  const child = spawn(candidate.command, candidate.args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONUTF8: "1"
    }
  });

  child.on("error", error => {
    if (error.code === "ENOENT") {
      start(index + 1);
      return;
    }
    console.error(`Não foi possível iniciar o servidor: ${error.message}`);
    process.exit(1);
  });
  child.on("exit", code => {
    process.exit(code ?? 0);
  });
}

start();
