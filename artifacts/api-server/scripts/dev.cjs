const { spawnSync } = require("node:child_process");

const environment = {
  ...process.env,
  NODE_ENV: "development",
};

const build = spawnSync(process.execPath, ["./build.mjs"], {
  stdio: "inherit",
  env: environment,
});

if (build.error) {
  console.error("No se pudo ejecutar la compilación:", build.error.message);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const start = spawnSync(
  process.execPath,
  ["--enable-source-maps", "./dist/index.mjs"],
  {
  stdio: "inherit",
  env: environment,
  },
);

if (start.error) {
  console.error("No se pudo iniciar la API:", start.error.message);
  process.exit(1);
}

process.exit(start.status ?? 1);