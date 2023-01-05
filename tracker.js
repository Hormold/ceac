import { DB } from "./utils/db.js";
import fs from 'fs';
import { resolve_captcha } from "./utils/captcha.js";
import {tpl} from './text.js';
import axios from "axios";
import tough from "tough-cookie";
import { CUT_OFF_NUMBERS } from "./cut_off_numbers.js";
const ROOT = 'https://ceac.state.gov';

const send_notification = async (msg, application) => {
	try {
		// Send telegram notification
		const newStatus = tpl('update', application.lang, {
			num: application.application_id,
			status: msg,
		})
		const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
		const res = await fetch(url, {
			method: "POST",
			body: new URLSearchParams({
				chat_id: application.notification_tg_id,
				text: newStatus,
				parse_mode: 'HTML',
			}),
		});
		const data = await res.json();
		if (!data.ok) {
			throw new Error(data.description);
		}
	} catch (e) {
		console.log(`Error sending telegram notification to ${application.notification_tg_id}: ${e.message}`);
	}
};

const refresh_once = async () => {
	console.log(`[${new Date().toISOString()}] Refreshing...`);
	const applications = await DB.query("SELECT * FROM application WHERE last_checked < NOW() - INTERVAL '18 hours'::interval OR last_checked IS NULL");
	console.log(`[${new Date().toISOString()}] ${applications.length} applications to check`);
	for (const application of applications) {
		console.log(`Application ID: ${application.application_id}, checking...`);
		try {
			const records = await DB.query("SELECT * FROM history WHERE application_id = $1 ORDER BY created_at DESC", [application.application_id]);
			if (records && records.find((r) => r.status === "Issued")) {
				console.log(`Application ${application.application_id} has already issued, skip.`);
				continue;
			}
			const [result, status] = await query_status(application.application_id);
			if(!result) {
				console.log(`Application ID: ${application.application_id}, problem with query status, check again in 1h`);
				await DB.query("UPDATE application SET last_checked = NOW() + INTERVAL '1 hours'::interval, last_error = $1 WHERE application_id = $2", [status, application.application_id]);
				continue;
			}
			// Check not have same status in records
			const hasSameStatus = records.find((r) => r.status === status);
			console.log(`Application ID: ${application.application_id}, previous statuses: ${records.map((r) => r.status).join(", ")}, has same status: ${hasSameStatus} | NEW STATUS: "${status}"`);
			if (!records.length || hasSameStatus) {
				console.log("Application ID: " + application.application_id + ", status: " + status);
				await send_notification(status, application);
				await DB.query("UPDATE application SET last_checked = NOW() WHERE application_id = $1", [application.application_id]);
				await DB.query("INSERT INTO history (application_id, status) VALUES ($1, $2)", [application.application_id, status]);
			} else {
				console.log(`Application ID: ${application.application_id}, status: ${status}, no change.`);
			}
		} catch (e) {
			console.log(`Application ID: ${application.application_id}, error: ${e.message}`);
		}
	}
	console.log(`[${new Date().toISOString()}] Refreshing done, ${applications.length} applications checked.`);
};

const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en,ru-RU;q=0.9,zh;q=0.8",
        "Cache-Control": "no-cache",
        "Host": "ceac.state.gov",
}

const update_from_current_page = (curPage, name) => {
	const ele = curPage.match(new RegExp(`input.*name="${name}".*value="(.*)"`));
	if (ele) {
      return ele[1];
    }
	return null;
};


const query_status = async (application_id) => {
	// Extract region from application_id: 2023EU0012345 => EU

	const applicationRegion = application_id.substring(4, 6);
	// Extract number YYYYREGIONNNNNNN => NNNNNN
	const applicationNumber = +application_id.substring(6);
	if(CUT_OFF_NUMBERS[applicationRegion] && applicationNumber < CUT_OFF_NUMBERS[applicationRegion]) {
		console.log(`Application ID: ${application_id}, number is too big, skip. Current max for ${applicationRegion}: ${CUT_OFF_NUMBERS[applicationRegion]}`);
		return [true, 'At NVC'];
	}

	console.log(`[APP ${application_id}] Querying status..., region: ${applicationRegion}, number: ${applicationNumber}`);

	try {
		const instance = axios.create({
			withCredentials: true,
			baseURL: ROOT,
			headers,
			// save cookies to whole session (not just one request)
		})
		const cookieJar = new tough.CookieJar();
		const req = await instance.get("/ceacstattracker/status.aspx?App=IV");
		cookieJar.setCookieSync(req.headers['set-cookie'][0], ROOT);
		const text = req.data;
		fs.writeFileSync("tmp/IV.html", text);
		console.log(`[APP ${application_id}] Saved IV.html.`)

		const captchaUrl = ROOT + (text.match(/c_status_ctl00_contentplaceholder1_defaultcaptcha_CaptchaImage.*src="(.*?)"/)[1]).replace(/amp;/g, "")
		console.log(`[APP ${application_id}] Captcha URL = ${captchaUrl}`);
		const img_resp = await instance.get(captchaUrl, {
			responseType: "arraybuffer",
			headers: {
				...headers,
				"Referer": "https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV",
				"Cookie": cookieJar.getCookieStringSync(ROOT),
			}
		});
		for(const key in img_resp.headers['set-cookie']) {
			cookieJar.setCookieSync(img_resp.headers['set-cookie'][key], ROOT);
		}
		// save updated cookies
		
		const img_text = img_resp.data.toString('base64')
		fs.writeFileSync("tmp/captcha.jpeg", img_resp.data);
		// console.log(`[APP ${application_id}] Saved captcha.jpeg.`)

		const captcha_num = await resolve_captcha(img_text);
		console.log(`[APP ${application_id}] Captcha resolved: ${captcha_num}`);
		let data = {
			"ctl00$ToolkitScriptManager1": "ctl00$ContentPlaceHolder1$UpdatePanel1|ctl00$ContentPlaceHolder1$btnSubmit",
			"__EVENTTARGET": "ctl00$ContentPlaceHolder1$btnSubmit",
			"__EVENTARGUMENT": "",
			"__LASTFOCUS": "",
			"__VIEWSTATE": "?????",
			"__VIEWSTATEGENERATOR": "DBF1011F",
			"__VIEWSTATEENCRYPTED": "",
			"ctl00$ContentPlaceHolder1$Visa_Application_Type": "IV",
			"ctl00$ContentPlaceHolder1$Visa_Case_Number": application_id,
			"ctl00$ContentPlaceHolder1$Captcha": "????",
			"LBD_VCID_c_status_ctl00_contentplaceholder1_defaultcaptcha": "?????",
			"LBD_BackWorkaround_c_status_ctl00_contentplaceholder1_defaultcaptcha": "0",
			"__ASYNCPOST": "true",
		};

		data["ctl00$ContentPlaceHolder1$Captcha"] = captcha_num.toUpperCase();
		const fields_need_update = [
			"__VIEWSTATE",
			"__VIEWSTATEGENERATOR",
			"LBD_VCID_c_status_ctl00_contentplaceholder1_defaultcaptcha",
		]
		for (const field of fields_need_update) {
			const result = update_from_current_page(text, field);
			if (result) {
				data[field] = result;
			} else {
				console.log(`[APP ${application_id}] Cannot update ${field} from current page.`)
			}
		}

		const form_data = new URLSearchParams();
		for (const [key, value] of Object.entries(data)) {
			form_data.append(key, value);
		}

		const req2 = await instance.post("/ceacstattracker/status.aspx?App=IV", form_data, {
			headers: {
				...headers,
				"Referer": "https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV",
				"Cookie": cookieJar.getCookieStringSync(ROOT),
			}
		});

		const text2 = req2.data;

		fs.writeFileSync("tmp/IV2.html", text2);
		console.log(`[APP ${application_id}] Saved IV2.html.`)
		// Extract status
		//  <span id="ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus">At NVC</span>
		const status = text2.match(/<span id="ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus">(.*?)<\/span>/)[1];
		if(!status) {
			console.log(`[APP ${application_id}] Cannot find status in IV2.html.`);
			return [false, "Cannot find status in IV2.html."];
		} else {
			console.log(`[APP ${application_id}] Status: ${status}`);
			return [true, status];
		}


	} catch (e) {
		console.log(`Error on application ${application_id}`, e);
		return [false, e.message];
	}

};

refresh_once();
setInterval(refresh_once, 1000 * 60 * 5); // 30 minutes