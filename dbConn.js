const { Pool } = require('pg');


const POSTGRES_HOST = process.env.POSTGRES_HOST || '127.0.0.1'
const POSTGRES_DB = process.env.POSTGRES_DB || 'recipies_db'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'password'
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'
const DATABASE_URL = process.env.DATABASE_URL;

const dbConfig = ({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: 6432
});

// potentially useful
// ssl: {
//   rejectUnauthorized: false
// }

let pool = null;

if(DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectionUnauthorized: false
        }
    })
} else {
    pool = new Pool(dbConfig);
}

pool.on('connect', () => {
    console.log('connected to the Database');
  });
  
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  module.exports = pool;