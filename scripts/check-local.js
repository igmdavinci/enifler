const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const requiredFiles = [
  "server.py",
  ".python-version",
  "api/index.py",
  "vercel.json",
  "enifler/www.enifler.com.br/index.html",
  "enifler/www.enifler.com.br/pc-gamer.html",
  "enifler/www.enifler.com.br/carrinho.html",
  "enifler/www.enifler.com.br/admin.html",
  "enifler/www.enifler.com.br/assets/store.js",
  "enifler/www.enifler.com.br/assets/store.css",
  "enifler/www.enifler.com.br/assets/footer/visa.svg",
  "enifler/www.enifler.com.br/assets/footer/mastercard.svg",
  "enifler/www.enifler.com.br/assets/footer/pix.svg",
  "enifler/www.enifler.com.br/assets/footer/ssl.svg",
  "enifler/www.enifler.com.br/assets/footer/ebit.png",
  "enifler/www.enifler.com.br/assets/footer/enifler-logo-white-jatpgm.png"
];

const missing = requiredFiles.filter(file => !existsSync(join(root, file)));
if (missing.length) {
  console.error("Arquivos ausentes:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const candidates = process.platform === "win32" ? ["py", "python"] : ["python3", "python"];
let checkedPython = false;

for (const command of candidates) {
  const result = spawnSync(command, ["-m", "py_compile", "server.py", "api/index.py"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONUTF8: "1"
    }
  });

  if (!result.error) {
    checkedPython = true;
    if (result.status !== 0) process.exit(result.status ?? 1);
    break;
  }
}

if (!checkedPython) {
  console.error("Não encontrei Python para validar o servidor.");
  process.exit(1);
}

console.log("Tudo certo: arquivos principais encontrados e servidor validado.");
