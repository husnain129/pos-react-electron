const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  await client.connect();
  const categories = await client.query('SELECT id, name, description, institute_id FROM categories LIMIT 5');
  console.log('\nCategories:', JSON.stringify(categories.rows, null, 2));
  
  const institutes = await client.query('SELECT id, name, zone, district FROM institutes LIMIT 5');
  console.log('\nInstitutes:', JSON.stringify(institutes.rows, null, 2));
  
  await client.end();
}

checkData().catch(console.error);
