// Run interactively; output SQL to a protected file, never commit it.
import { createInterface } from 'node:readline/promises';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const rl = createInterface({input: process.stdin, output: process.stderr});
const username = (await rl.question('Admin username: ')).trim();
// Use a password from the terminal, not a command-line argument or environment variable.
console.error('Password will be visible while typing; use a private terminal.');
const password = await rl.question('Admin password (at least 16 characters): '); rl.close();
if (!/^[a-zA-Z0-9_.-]{3,64}$/.test(username) || password.length < 16 || password.length > 256) throw new Error('Invalid username or password');
const salt=randomBytes(16).toString('hex'); const hash=pbkdf2Sync(password,salt,310000,32,'sha256').toString('hex');
await writeFile('admin-bootstrap.local.sql', `INSERT INTO admins (id,username,salt,password_hash) VALUES ('${randomBytes(16).toString('hex')}','${username}','${salt}','${hash}');\n`, {mode:0o600, flag:'wx'});
console.error('Created admin-bootstrap.local.sql. Apply it with Wrangler and delete it immediately.');
