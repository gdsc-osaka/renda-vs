// Generate SHA-256 hash + random salt for host password.
// Usage: npm run hash-password -- "your-password"
import { createHash, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = createHash("sha256").update(salt + password).digest("hex");

console.log("Add the following to .env (or .env.local):\n");
console.log(`VITE_HOST_PASSWORD_SALT=${salt}`);
console.log(`VITE_HOST_PASSWORD_HASH=${hash}`);
