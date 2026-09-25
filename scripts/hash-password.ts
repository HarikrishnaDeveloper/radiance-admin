// Prints a bcrypt hash for the given password — paste the result into
// ADMIN_PASSWORD_HASH in .env. The plaintext password is never stored anywhere.
// Usage: npm run auth:hash-password -- "your-password"
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run auth:hash-password -- "your-password"');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  // Next.js expands $VAR inside .env files, so every literal $ in the hash
  // must be escaped as \$ or the loaded value gets silently mangled.
  const escaped = hash.replace(/\$/g, '\\$');
  console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
}

main();
