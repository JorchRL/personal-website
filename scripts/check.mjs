// pnpm check: lint, then types, then tests. Stops at the first failure.
import { spawnSync } from "node:child_process";

const steps = [
  ["lint", ["eslint", "."]],
  ["types", ["tsc", "--noEmit"]],
  ["tests", ["vitest", "run"]],
];

for (const [name, [cmd, ...args]] of steps) {
  console.log(`\n— check: ${name}`);
  const result = spawnSync("pnpm", ["exec", cmd, ...args], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\ncheck failed at: ${name}`);
    process.exit(result.status ?? 1);
  }
}
console.log("\ncheck passed");
