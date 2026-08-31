const fs = require("node:fs");
const path = require("node:path");

const packageManager = process.env.npm_config_user_agent || "";

if (!packageManager.startsWith("pnpm/")) {
  console.error("Este proyecto debe instalarse con pnpm. Ejecuta: pnpm install");
  process.exit(1);
}

for (const lockFile of ["package-lock.json", "yarn.lock"]) {
  const filePath = path.join(process.cwd(), lockFile);

  try {
    fs.rmSync(filePath, { force: true });
  } catch (error) {
    console.error(`No se pudo eliminar ${lockFile}:`, error.message);
    process.exit(1);
  }
}

console.log("Verificación correcta: se está utilizando pnpm.");