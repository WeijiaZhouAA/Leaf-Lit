import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { initdb, postgres } from "@embedded-postgres/windows-x64";

const port = Number(process.env.PG_PORT ?? 5432);
const user = process.env.PG_USER ?? "postgres";
const password = process.env.PG_PASSWORD ?? "postgres";
const database = process.env.PG_DATABASE ?? "leaflit";
const databaseDir = path.join(process.env.LOCALAPPDATA || os.tmpdir(), "leaflit-pgdata");

mkdirSync(databaseDir, { recursive: true });

const env = {
  ...process.env,
  LANG: "C",
  LC_ALL: "C",
  LC_MESSAGES: "C",
  LANGUAGE: "C",
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${path.basename(command)} exited with ${code}`))));
  });
}

if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
  const passwordFile = path.join(os.tmpdir(), "leaflit-pg-password.txt");
  writeFileSync(passwordFile, `${password}\n`);
  await run(initdb, [
    `--pgdata=${databaseDir}`,
    "--auth=password",
    `--username=${user}`,
    `--pwfile=${passwordFile}`,
    "--locale=C",
    "--encoding=SQL_ASCII",
  ]);
  console.log("Initialised local PostgreSQL.");
}

await new Promise((resolve) => {
  const single = spawn(postgres, ["--single", "-D", databaseDir, "template1"], { env, stdio: ["pipe", "inherit", "inherit"] });
  single.stdin.write(`CREATE DATABASE ${database};\n`);
  single.stdin.end();
  single.on("exit", () => resolve());
});

const server = spawn(postgres, ["-D", databaseDir, "-p", String(port)], {
  env,
  stdio: "inherit",
});

server.on("exit", (code) => {
  console.error(`PostgreSQL stopped (${code ?? "signal"}).`);
  process.exit(code ?? 1);
});

setTimeout(() => {
  console.log(`PostgreSQL is running on localhost:${port}`);
  console.log(`DATABASE_URL=postgresql://${user}:${password}@localhost:${port}/${database}?schema=public`);
  console.log("Leave this process running. Press Ctrl+C to stop.");
}, 1500);

process.on("SIGINT", () => server.kill("SIGINT"));
process.on("SIGTERM", () => server.kill("SIGTERM"));
