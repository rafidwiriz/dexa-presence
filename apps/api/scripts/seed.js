const { Client } = require('pg');
const bcrypt = require('bcrypt');

function req(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var: ${name} (see .env.example)`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USER || 'dexa',
    password: process.env.DATABASE_PASSWORD || 'dexa',
    database: process.env.DATABASE_NAME || 'dexa_presence',
  });
  await client.connect();

  const users = [
    { name: 'HRD Admin', email: req('SEED_ADMIN_EMAIL'), password: req('SEED_ADMIN_PASSWORD'), position: 'HRD Admin', role: 'admin' },
    { name: 'Budi Santoso', email: req('SEED_EMPLOYEE_EMAIL'), password: req('SEED_EMPLOYEE_PASSWORD'), position: 'Software Engineer', role: 'employee' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await client.query(
      `INSERT INTO employees
         (id, name, company_email, password_hash, position, phone, photo_url, role, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NULL, NULL, $5, true, now(), now())
       ON CONFLICT (company_email) DO NOTHING`,
      [u.name, u.email, hash, u.position, u.role]
    );
    console.log(`seeded ${u.email}`);
  }
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
