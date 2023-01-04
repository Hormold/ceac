import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const Pools = [
	new pg.Pool({
		connectionString: process.env.POSTGRES_URL,
		ssl: process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'demo' || process.env.NODE_ENV === 'test' ? false : { rejectUnauthorized: false },
		min: process.env.DATABASE_POOL_MIN || 5,
		max: process.env.DATABASE_POOL_MAX || 30,
		idleTimeoutMillis: process.env.DATABASE_POOL_IDLE_TIMEOUT || 30000,
	}),
];

export const DB = {
	queryError: (error, query, args) => Error(`Error at query ${error},\n query: ${query},\n args: ${args}, PgSQL`),

	query: async (query, args, pool = Pools[0]) => {
		const client = await pool.connect();
		try {
			const result = (await client.query(query, args)).rows;
			client.release();
			return result;
		} catch (error) {
			client.release();
			throw DB.queryError(error, query, args);
		}
	},

	queryOne: async (query, args, pool = Pools[0]) => {
		const client = await pool.connect();
		try {
			const result = (await client.query(query, args)).rows[0];
			client.release();
			return result;
		} catch (error) {
			client.release();
			throw DB.queryError(error, query, args);
		}
	},

	getStats: (pool = Pools[0]) => ({
		totalCount: pool.totalCount,
		idleCount: pool.idleCount,
		waitingCount: pool.waitingCount,
	}),

	transaction: async (queryArr, argsArr, pool = Pools[0]) => {
		const results = [];
		const client = await pool.connect();
		let i = 0;
		try {
			await client.query('BEGIN');
			for (const query of queryArr) {
				const args = argsArr[i];
				try {
					const res = await client.query(query, args);
					results.push(res.rows);
				} catch (err) {
					throw DB.queryError(err, query, args);
				}
				i++;
			}
			await client.query('COMMIT');
			client.release();
			return results;
		} catch (e) {
			await client.query('ROLLBACK');
			client.release();
			throw DB.queryError(e, queryArr.join(','), argsArr.join(','));
		}
	},

	createTX: async () => {
		const client = await Pools[0].connect();
		try {
			await client.query('BEGIN');
			return {
				query: async (query, args) => {
					try {
						const res = await client.query(query, args);
						return res.rows;
					} catch (err) {
						throw DB.queryError(err, query, args);
					}
				},
				commit: async () => {
					// const err = new Error();
					// console.log('Commit called from', err.stack);
					await client.query('COMMIT');
					client.release();
				},
				rollback: async () => {
					// const err = new Error();
					// console.log('Rollback called from', err.stack);
					await client.query('ROLLBACK');
					client.release();
				},
				release: async () => {
					try {
						client.release();
					} catch (e) {
						// Do nothing
					}
				},
			};
		} catch (e) {
			await client.query('ROLLBACK');
			client.release();
			throw DB.queryError(e, 'BEGIN', '');
		}
	},

};
