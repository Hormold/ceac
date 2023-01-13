import { DB } from './db.js';

const get2captchaBalance = async () => {
	const url = 'http://rucaptcha.com/res.php';
	const params = {
		key: process.env.RUCAPTCHA_KEY,
		action: 'getbalance',
		json: 1,
	};
	const response = await fetch(url, {
		method: 'POST',
		body: new URLSearchParams(params),
	});
	const data = await response.json();
	return data.request;
};

const getDBStats = async () => {
	const stats = await DB.query('SELECT COUNT(*) FROM application');
	return {
		totalCount: stats[0].count,
	};
};

let statsCache = {

};

const statsTS = 0;
const statsTTL = 1000 * 60 * 5;

export const getStats = async () => {
	if (Date.now() - statsTS > statsTTL) {
		const dbStats = await getDBStats();
		const captchaBalance = await get2captchaBalance();
		statsCache = {
			...dbStats,
			captchaBalance,
		};
	}
	return statsCache;
};
