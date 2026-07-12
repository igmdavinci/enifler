const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const root = join(__dirname, "..");
const snippet = [
  "import server",
  "server.load_dotenv()",
  "server.refresh_config()",
  "server.setup_database()",
  "print('Banco configurado pronto para uso.')"
].join("; ");

const candidates = process.platform === "win32" ? ["py", "python"] : ["python3", "python"];

for (const command of candidates) {
  const result = spawnSync(command, ["-c", snippet], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONUTF8: "1"
    }
  });

  if (!result.error) {
    process.exit(result.status ?? 0);
  }
}

console.error("Não consegui encontrar Python instalado para preparar o banco local.");
process.exit(1);
