// inside db/index.js
const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function createUser({ username, password }) {
  try {
    const result = await client.query(
      `
     INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
      `, [username, password]);

    return result;
  } catch (error) {
    throw error;
  }
}


async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username 
      FROM users;
    `);
  
    return rows;
  }
module.exports = {
  client,
  getAllUsers,
  createUser
}

