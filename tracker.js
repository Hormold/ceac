import { DB } from './utils/db.js';
import fs from 'fs';
import { resolve_captcha } from './utils/captcha.js';
import { tpl } from './text.js';
import axios from 'axios';
import tough from 'tough-cookie';
import { CUT_OFF_NUMBERS } from './cut_off_numbers.js';
import { sendMessage } from './utils/tg.js';
import { log } from './utils/logger.js';

const CURRENT_YEAR = 2023; // DV fiscal year
const ROOT = 'https://ceac.state.gov';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const fields_need_update = [
	'__VIEWSTATE',
	'__VIEWSTATEGENERATOR',
	'LBD_VCID_c_status_ctl00_contentplaceholder1_defaultcaptcha',
];
const headers = {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en,ru-RU;q=0.9,zh;q=0.8',
	'Cache-Control': 'no-cache',
	Host: 'ceac.state.gov',
	Referer: 'https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV',
};

const send_notification = async (msg, application) => {
	try {
		const newStatus = tpl('update', application.lang, {
			num: application.application_id,
			status: msg,
		});
		const data = await sendMessage(application.notification_tg_id, newStatus);
		if (application.additional_tg_id)
			await sendMessage(application.additional_tg_id, newStatus);
		if (!data.ok)
			throw new Error(data.description);
	} catch (e) {
		log(`Error sending telegram notification to ${application.notification_tg_id}: ${e.message}`);
	}
};

export const remove_application = async application_id => {
	await DB.query('DELETE FROM history WHERE application_id = $1', [application_id]);
	return DB.queryOne('DELETE FROM application WHERE application_id = $1 RETURNING *', [application_id]);
};

export const refresh_once = async () => {
	const applications = await DB.query("SELECT * FROM application WHERE last_checked < NOW() - INTERVAL '1 hours'::interval OR last_checked IS NULL");
	for (const application of applications) {
		log(`Application ID: ${application.application_id}, checking...`);
		try {
			const records = await DB.query('SELECT * FROM history WHERE application_id = $1 ORDER BY created_at DESC', [application.application_id]);
			if (records && records.find(r => r.status === 'Issued')) {
				log(`Application ${application.application_id} has already issued, skip.`);
				continue;
			}
			const [result, status] = await query_status(application.application_id);
			if (!result) {
				let addedHours = 1;
				if (application.error_counter > 1) addedHours = Math.floor(application.error_counter * 2);
				log(`Application ID: ${application.application_id}, problem with query status, check again in ${addedHours}h | Error (${application.error_counter}): ${status}`);
				// Shift last_checked to future (to avoid checking too often)
				await DB.query(`UPDATE application SET last_checked = coalesce(last_checked, now()) + INTERVAL '${addedHours} hours'::interval, last_error = $1, error_counter = error_counter + 1 WHERE application_id = $2`, [status, application.application_id]);
				if (application.error_counter > 5)
					await remove_application(application.application_id);
				
				continue;
			}
			// Check not have same status in records
			const hasSameStatus = records.find(r => r.status === status);
			log(`Application ID: ${application.application_id}, previous statuses: ${records.map(r => r.status).join(', ')}, has same status: ${hasSameStatus} | NEW STATUS: "${status}"`);
			if (!records.length || !hasSameStatus) {
				log('Application ID: ' + application.application_id + ', status: ' + status);
				await send_notification(status, application);
				await DB.query('UPDATE application SET last_checked = NOW(), error_counter = 0 WHERE application_id = $1', [application.application_id]);
				await DB.query('INSERT INTO history (application_id, status) VALUES ($1, $2)', [application.application_id, status]);
			} else {
				log(`Application ID: ${application.application_id}, status: ${status}, no change.`);
				await DB.query('UPDATE application SET last_checked = NOW(), error_counter = 0 WHERE application_id = $1', [application.application_id]);
			}
		} catch (e) {
			log(`Application ID: ${application.application_id}, error: ${e.message}`);
		}
	}
	if (applications.length > 0) log(`Refreshing done, ${applications.length} applications checked.`);
};

const update_from_current_page = (curPage, name) => {
	const ele = curPage.match(new RegExp(`input.*name="${name}".*value="(.*)"`));
	if (ele)
		return ele[1];
    
	return null;
};

export const initSelfCheck = async () => {
	const instance = axios.create({
		withCredentials: true,
		baseURL: ROOT,
		headers,
		// save cookies to whole session (not just one request)
	});
	const cookieJar = new tough.CookieJar();
	const req = await instance.get('/ceacstattracker/status.aspx?App=IV');
	cookieJar.setCookieSync(req.headers['set-cookie'][0], ROOT);
	const text = req.data;

	const captchaUrl = ROOT + (text.match(/c_status_ctl00_contentplaceholder1_defaultcaptcha_CaptchaImage.*src="(.*?)"/)[1]).replace(/amp;/g, '');
	const img_resp = await instance.get(captchaUrl, {
		responseType: 'arraybuffer',
		headers: {
			...headers,
			Referer: 'https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV',
			Cookie: cookieJar.getCookieStringSync(ROOT),
		},
	});
	for (const key in img_resp.headers['set-cookie'])
		cookieJar.setCookieSync(img_resp.headers['set-cookie'][key], ROOT);
	
	const img_text = img_resp.data.toString('base64');

	return {
		cookieJar,
		captcha: img_text,
		instance,
		text,
	};
};

export const finalizeSelfCheck = async (application_id, captcha, cache) => {
	try {
		const data = {
			ctl00$ToolkitScriptManager1: 'ctl00$ContentPlaceHolder1$UpdatePanel1|ctl00$ContentPlaceHolder1$btnSubmit',
			__EVENTTARGET: 'ctl00$ContentPlaceHolder1$btnSubmit',
			__EVENTARGUMENT: '',
			__LASTFOCUS: '',
			__VIEWSTATE: '?????',
			__VIEWSTATEGENERATOR: 'DBF1011F',
			__VIEWSTATEENCRYPTED: '',
			ctl00$ContentPlaceHolder1$Visa_Application_Type: 'IV',
			ctl00$ContentPlaceHolder1$Visa_Case_Number: application_id,
			ctl00$ContentPlaceHolder1$Captcha: '????',
			LBD_VCID_c_status_ctl00_contentplaceholder1_defaultcaptcha: '?????',
			LBD_BackWorkaround_c_status_ctl00_contentplaceholder1_defaultcaptcha: '0',
			__ASYNCPOST: 'true',
		};

		data.ctl00$ContentPlaceHolder1$Captcha = captcha.toUpperCase();
	
		for (const field of fields_need_update) {
			const result = update_from_current_page(cache.text, field);
			if (result)
				data[field] = result;
		}

		const form_data = new URLSearchParams();
		for (const [key, value] of Object.entries(data))
			form_data.append(key, value);

		const req2 = await cache.instance.post('/ceacstattracker/status.aspx?App=IV', form_data, {
			headers: {
				...headers,
				Cookie: cache.cookieJar.getCookieStringSync(ROOT),
			},
		});

		const status = req2.data.match(/<span id="ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus">(.*?)<\/span>/)[1];
		if (!status)
			return [false, 'Cannot find status'];
		else
			return [true, status];
	} catch (e) {
		return [false, e.message];
	}
};

const query_status = async application_id => {
	// Extract region from application_id: 2023EU0012345 => EU
	const applicationRegion = application_id.substring(4, 6);
	// Extract number YYYYREGIONNNNNNN => NNNNNN
	const applicationNumber = +application_id.substring(6);
	
	if (CUT_OFF_NUMBERS[applicationRegion] && applicationNumber > CUT_OFF_NUMBERS[applicationRegion]) {
		log(`Application ID: ${application_id}, number is too big, skip. Current max for ${applicationRegion}: ${CUT_OFF_NUMBERS[applicationRegion]}`);
		return [true, 'At NVC'];
	} else {
		log(`Application ID: ${application_id}, number is ok, continue. number: ${applicationNumber}, region: ${applicationRegion}`);
		log(`Current max for ${applicationRegion}: ${CUT_OFF_NUMBERS[applicationRegion]}`, CUT_OFF_NUMBERS);
	}

	log(`[APP ${application_id}] Querying status..., region: ${applicationRegion}, number: ${applicationNumber}`);

	try {
		const instance = axios.create({
			withCredentials: true,
			baseURL: ROOT,
			headers,
			// save cookies to whole session (not just one request)
		});
		const cookieJar = new tough.CookieJar();
		const req = await instance.get('/ceacstattracker/status.aspx?App=IV');
		cookieJar.setCookieSync(req.headers['set-cookie'][0], ROOT);
		const text = req.data;
		if (process.env.DEBUG) fs.writeFileSync('tmp/IV.html', text);
		log(`[APP ${application_id}] Saved IV.html.`);

		const captchaUrl = ROOT + (text.match(/c_status_ctl00_contentplaceholder1_defaultcaptcha_CaptchaImage.*src="(.*?)"/)[1]).replace(/amp;/g, '');
		log(`[APP ${application_id}] Captcha URL = ${captchaUrl}`);
		const img_resp = await instance.get(captchaUrl, {
			responseType: 'arraybuffer',
			headers: {
				...headers,
				Referer: 'https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV',
				Cookie: cookieJar.getCookieStringSync(ROOT),
			},
		});
		for (const key in img_resp.headers['set-cookie'])
			cookieJar.setCookieSync(img_resp.headers['set-cookie'][key], ROOT);
		
		// save updated cookies
		
		const img_text = img_resp.data.toString('base64');
		if (process.env.DEBUG) fs.writeFileSync('tmp/captcha.jpeg', img_resp.data);

		const captcha_num = await resolve_captcha(img_text);
		log(`[APP ${application_id}] Captcha resolved: ${captcha_num}`);
		const data = {
			ctl00$ToolkitScriptManager1: 'ctl00$ContentPlaceHolder1$UpdatePanel1|ctl00$ContentPlaceHolder1$btnSubmit',
			__EVENTTARGET: 'ctl00$ContentPlaceHolder1$btnSubmit',
			__EVENTARGUMENT: '',
			__LASTFOCUS: '',
			__VIEWSTATE: '?????',
			__VIEWSTATEGENERATOR: 'DBF1011F',
			__VIEWSTATEENCRYPTED: '',
			ctl00$ContentPlaceHolder1$Visa_Application_Type: 'IV',
			ctl00$ContentPlaceHolder1$Visa_Case_Number: application_id,
			ctl00$ContentPlaceHolder1$Captcha: '????',
			LBD_VCID_c_status_ctl00_contentplaceholder1_defaultcaptcha: '?????',
			LBD_BackWorkaround_c_status_ctl00_contentplaceholder1_defaultcaptcha: '0',
			__ASYNCPOST: 'true',
		};

		data.ctl00$ContentPlaceHolder1$Captcha = captcha_num.toUpperCase();
		for (const field of fields_need_update) {
			const result = update_from_current_page(text, field);
			if (result)
				data[field] = result;
			else
				log(`[APP ${application_id}] Cannot update ${field} from current page.`);
		}

		const form_data = new URLSearchParams();
		for (const [key, value] of Object.entries(data))
			form_data.append(key, value);

		const req2 = await instance.post('/ceacstattracker/status.aspx?App=IV', form_data, {
			headers: {
				...headers,
				Referer: 'https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV',
				Cookie: cookieJar.getCookieStringSync(ROOT),
			},
		});

		const text2 = req2.data;

		if (process.env.DEBUG) fs.writeFileSync('tmp/IV2.html', text2);
		log(`[APP ${application_id}] Saved IV2.html.`);
		// Extract status
		//  <span id="ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus">At NVC</span>
		try {
			const status = text2.match(/<span id="ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus">(.*?)<\/span>/)[1];
			if (!status) {
				log(`[APP ${application_id}] Cannot find status in IV2.html.`);
				return [false, 'Cannot find status in IV2.html.'];
			} else {
				log(`[APP ${application_id}] Status: ${status}`);
				return [true, status];
			}
		} catch (e) {
			log(`[APP ${application_id}] Error on extracting status.`);
			return [false, 'Unknown'];
		}
	} catch (e) {
		log(`Error on application ${application_id}`, e);
		return [false, e.message];
	}
};

export const visaBulletenTracker = async () => {
	const nextBulletin = new Date();
	nextBulletin.setMonth(nextBulletin.getMonth() + 1);
	const url = `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${CURRENT_YEAR}/visa-bulletin-for-${months[nextBulletin.getMonth()]}-${CURRENT_YEAR}.html`;
	try {
		const content = await axios.get(url, {
			url,
			throwHttpErrors: false,
		});
		const text = content.data;
		if (text.match(/404 - Page Not Found/i))
			log('[VBT] Cannot find next bulletin.');
		else
			// log(`!!!!!!!!!!!!!!!!!!!! [VBT] Next bulletin found: ${url}`);
			reportNextBulletin(months[nextBulletin.getMonth()], url);
	} catch (e) {
		if (e.message.match(/404/i))
			log('[VBT] Cannot find next bulletin.');
		else
			log(`[VBT] Error: ${e.message}`);
	}
};

const reportNextBulletin = async (month, url) => {
	const [reported] = await DB.query('SELECT * FROM bul_reports WHERE month = $1 AND year = $2', [month, CURRENT_YEAR]);
	if (reported) return;

	const getUsers = await DB.query('SELECT * FROM bul_sub WHERE is_notified_monthly = FALSE');

	// Get user chunks by 20
	const chunks = [];
	for (let i = 0; i < getUsers.length; i += 20)
		chunks.push(getUsers.slice(i, i + 20));

	for (const chunk of chunks) {
		for (const user of chunk) {
			try {
				const text = tpl('bul_update', user.lang, {
					url,
				});
				await sendMessage(user.tg_id, text, {
					parse_mode: 'HTML',
					disable_web_page_preview: true,
				});
				log(`[reportNextBulletin] Sent to ${user.tg_id} (${user.lang})`);
			} catch (e) {
				log(`[reportNextBulletin] Error: ${e.message}`, e);
			}
			await sleep(500);
		}
		await sleep(5000);
	}

	await DB.query('INSERT INTO bul_reports (month, year) VALUES ($1, $2)', [month, CURRENT_YEAR]);
	log(`[reportNextBulletin] Reported next bulletin finished: ${month} ${CURRENT_YEAR}`);
};
