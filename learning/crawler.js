import fs from 'fs';
import axios from 'axios-https-proxy-fix';
import tough from 'tough-cookie';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
// Crawler to save dataset of captchas from CEAC website
const ROOT = 'https://ceac.state.gov';
let i = 0;

const headers = {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en,ru-RU;q=0.9,zh;q=0.8',
	'Cache-Control': 'no-cache',
	Host: 'ceac.state.gov',
};
const loadData = async id => {
	const instance = axios.create({
		withCredentials: true,
		baseURL: ROOT,
		headers,
		proxy: {
			host: '127.0.0.1',
			port: 24000,
		},
		// save cookies to whole session (not just one request)
	});

	const cookieJar = new tough.CookieJar();
	try {
		const req = await instance.get('/ceacstattracker/status.aspx?App=IV');
		cookieJar.setCookieSync(req.headers['set-cookie'][0], ROOT);
		const text = req.data;
		const captchaUrl = ROOT + (text.match(/c_status_ctl00_contentplaceholder1_defaultcaptcha_CaptchaImage.*src="(.*?)"/)[1]).replace(/amp;/g, '');
		console.log(`Captcha URL = ${captchaUrl} #${id}`);
		const img_resp = await instance.get(captchaUrl, {
			responseType: 'arraybuffer',
			headers: {
				...headers,
				Referer: 'https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV',
				Cookie: cookieJar.getCookieStringSync(ROOT),
			},
			
		});
		
		fs.writeFileSync('../tmp/dataset/' + Date.now() + '_' + id + '.jpeg', img_resp.data);
		console.log(`Saved captcha.jpeg #${id}`);
		return true;
	} catch (e) {
		console.log(`Error: ${e.message} #${id}`);
		return false;
	}
};

const main = async () => {
	console.log(`Starting iteration #${i}`);
	// Run asynchrnously in 5 threads
	const threads = 30;
	const promises = [];
	for (let a = 0; a < threads; a++) {
		promises.push(loadData(i));
		i++;
	}
	await Promise.all(promises);
	// sleep for 5 seconds
	await new Promise(resolve => setTimeout(resolve, 5000));
	console.log(`Finished iteration #${i}`);
	main();
};

main();
