import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { tpl } from './text.js';
import { DB } from './utils/db.js';
import { getStats } from './utils/stats.js';
import moment from 'moment';
import { CUT_OFF_NUMBERS } from './cut_off_numbers.js';
import { remove_application, finalizeSelfCheck, initSelfCheck, refresh_once, visaBulletenTracker } from './tracker.js';
dotenv.config();

const CASE_REGEXP = /^2023(EU|AF|AS|OC|SA|NA)\d{1,7}$/i; // Valid case regexp: 2023 + (EU|AF|AS|OC|SA|NA) + 1...7 digits
const CAPTCHA_REGEXP = /^[A-Z0-9]{4,6}$/; // Captcha: 4-6 digits, A-Z, 0-9
const bot = new Telegraf(process.env.BOT_TOKEN);
const selfCheckMemory = {};

bot.start(async ctx => {
	const stats = await getStats();
	ctx.replyWithHTML(tpl('start', ctx.from.language_code, stats));
});

bot.help(async ctx => {
	const { id } = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE (notification_tg_id = $1 OR additional_tg_id = $1)', [id]);
	let currentStatus;
	let subscribed = false;
	const sub = await DB.queryOne('SELECT * FROM bul_sub WHERE tg_id = $1', [id]);
	if (sub)
		subscribed = true;
	
	if (status)
		currentStatus = tpl('statuses.tracking', ctx.from.language_code, {
			caseNumber: status.application_id,
		});
	else
		currentStatus = tpl('statuses.nottracking', ctx.from.language_code);

	const current_cut_off = tpl('current_cut_off', ctx.from.language_code, CUT_OFF_NUMBERS);

	ctx.replyWithHTML(tpl('help', ctx.from.language_code, {
		status: currentStatus + '\n' + current_cut_off,
		subscribed: tpl(subscribed ? 'bul.status_ok' : 'bul.status_not_ok', ctx.from.language_code),
	}));
});

bot.command('subscribe', async ctx => {
	const { id } = ctx.from;
	const status = await DB.queryOne('SELECT * FROM bul_sub WHERE tg_id = $1', [id]);
	if (status) {
		await DB.query('DELETE FROM bul_sub WHERE tg_id = $1', [id]);
		return ctx.reply(tpl('bul.unsbscribed', ctx.from.language_code));
	}
	await DB.query('INSERT INTO bul_sub (tg_id, lang) VALUES ($1, $2)', [id, ctx.from.language_code]);
	ctx.replyWithHTML(tpl('bul.subscribed', ctx.from.language_code));
});

bot.command('donate', ctx => ctx.replyWithMarkdown(tpl('donate', ctx.from.language_code)));
bot.command('stats', async ctx => {
	const stats = await getStats();
	ctx.replyWithHTML(tpl('stats', ctx.from.language_code, stats));
});

bot.command('remove', async ctx => ctx.replyWithHTML(tpl('caseRemoveSure', ctx.from.language_code)));
bot.command('removeSure', async ctx => {
	const { id } = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE (notification_tg_id = $1 OR additional_tg_id = $1)', [id]);
	if (!status)
		return ctx.replyWithHTML(tpl('errors.caseStatusesEmpty', ctx.from.language_code));
	
	const result = await remove_application(status.application_id, id);
	if (result)
		ctx.replyWithHTML(tpl('caseRemoved', ctx.from.language_code));

	console.log(`[REMOVE] ${ctx.from.username} (${ctx.from.id}) removed case from tracking`);
});

bot.command('status', async ctx => {
	const { id } = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE (notification_tg_id = $1 OR additional_tg_id = $1)', [id]);
	if (!status)
		return ctx.reply(tpl('errors.caseStatusesEmpty', ctx.from.language_code));
	
	const { application_id } = status;
	const statuses = await DB.query('SELECT * FROM history WHERE application_id = $1 ORDER BY record_id DESC', [application_id]);
	if (!statuses.length)
		return ctx.reply(tpl('errors.caseNotTracked', ctx.from.language_code));
	
	// build log: status (date changed)
	const latestStatus = statuses[0];

	const applicationRegion = application_id.substring(4, 6);
	const applicationNumber = parseInt(application_id.substring(6));
	let cutOffString;
	if (CUT_OFF_NUMBERS[applicationRegion] < applicationNumber)
		cutOffString = tpl('cutoff', ctx.from.language_code, {
			region: applicationRegion,
			cutOffNumbers: CUT_OFF_NUMBERS[applicationRegion],
		}) + '\n';
	else
		cutOffString = '\n';

	ctx.replyWithHTML(tpl('caseStatus', ctx.from.language_code, {
		num: application_id,
		status: latestStatus.status,
		statusUpdated: new Date(latestStatus.created_at).toLocaleString(ctx.from.language_code),
		statusSince: moment(latestStatus.created_at).locale(ctx.from.language_code).fromNow(),
		cutOffString,

		checked: status.last_checked ? new Date(status.last_checked).toLocaleString(ctx.from.language_code) : tpl('statuses.inprocess', ctx.from.language_code),
		checkedSince: status.last_checked ? moment(status.last_checked).locale(ctx.from.language_code).fromNow() : '🔄',
	}));
});

bot.command('self', async ctx => {
	// Trigger self update, and ask user to solve captcha
	const { id } = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE (notification_tg_id = $1 OR additional_tg_id = $1)', [id]);
	if (!status)
		return ctx.replyWithHTML(tpl('errors.caseStatusesEmpty', ctx.from.language_code));

	const { application_id } = status;
	// Minimum recheck time is 10 minutes
	if (status.last_checked && (Date.now() - status.last_checked) < 10 * 60 * 1000)
		return ctx.replyWithHTML(tpl('errors.tooFast', ctx.from.language_code));
	try {
		const result = await initSelfCheck(application_id);
		const imgbase = Buffer.from(result.captcha, 'base64');
		selfCheckMemory[ctx.from.id] = {
			cached: Date.now(),
			application_id,
			...result,
		};
		ctx.replyWithPhoto({
			source: imgbase,
		}, {
			caption: tpl('selfCheck', ctx.from.language_code, {
				num: application_id,
			}),
			text: tpl('selfCheck', ctx.from.language_code, {
				num: application_id,
			}),
		});
		console.log(`[${application_id}] Self check triggered by ${ctx.from.id}`);
	} catch (e) {
		ctx.replyWithHTML(tpl('errors.captcha', ctx.from.language_code));
	}
});

bot.command('force', async ctx => {
	// Admin tool to force check
	const { id } = ctx.from;
	if (id !== +process.env.ADMIN_ID)
		return ctx.replyWithHTML(tpl('errors.noAccess', ctx.from.language_code));

	// Reset check time
	await DB.query('UPDATE application SET last_checked = NULL WHERE notification_tg_id = $1', [id]);
	ctx.replyWithHTML(tpl('force', ctx.from.language_code));
});

bot.on('text', async ctx => {
	const { id } = ctx.from;
	const { text } = ctx.message;
	if (text.length > 3 && text.length <= 6 && selfCheckMemory[id] && CAPTCHA_REGEXP.test(text)) {
		const cache = selfCheckMemory[id];
		const [isSuccess, status] = await finalizeSelfCheck(cache.application_id, text, cache);
		delete selfCheckMemory[id];
		if (isSuccess) {
			await DB.query('UPDATE application SET last_checked = NOW() WHERE (notification_tg_id = $1 OR additional_tg_id = $1)', [id]);
			await DB.query('INSERT INTO history (application_id, status) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cache.application_id, status]);
			return ctx.replyWithHTML(tpl('selfCheckSuccess', ctx.from.language_code, {
				status,
				num: cache.application_id,
			}));
		} else {
			await DB.query('UPDATE application SET last_checked = NOW(), last_error = $1 WHERE notification_tg_id = $2', [status, id]);
			return ctx.replyWithHTML(tpl('errors.selfCheckFail', ctx.from.language_code));
		}
	}

	if (!CASE_REGEXP.test(text))
		return ctx.replyWithHTML(tpl('errors.invalidCaseNumber', ctx.from.language_code));

	const caseId = text.toUpperCase();
	console.log(`[INFO] User ${id} added case ${caseId}`);
	
	const isCaseExists = await DB.queryOne('SELECT * FROM application WHERE (application_id = $1 OR additional_tg_id = $1)', [caseId]);
	if (isCaseExists)
		return ctx.replyWithHTML(tpl('errors.caseAlreadyTracked', ctx.from.language_code));

	// Case limit
	const casesCount = await DB.queryOne('SELECT COUNT(*) FROM application WHERE notification_tg_id = $1', [id]);
	if (casesCount.count >= 1)
		return ctx.replyWithHTML(tpl('errors.caseLimitPerUser', ctx.from.language_code));

	const result = await DB.queryOne('INSERT INTO application (application_id, notification_tg_id, lang) VALUES ($1, $2, $3) RETURNING *', [caseId, id, ctx.from.language_code]);
	if (result)
		ctx.replyWithHTML(tpl('caseAdded', ctx.from.language_code));
	else
		ctx.replyWithHTML(tpl('errors.caseAlreadyAdded', ctx.from.language_code));
});

bot.launch();
console.log('[INFO] Bot started');
if (process.env.ADMIN_ID)
	bot.telegram.sendMessage(+process.env.ADMIN_ID, 'Bot started');

if (!process.env.DEBUG) {
	console.log('[INFO] Starting tracker');
	// Track (aka cron)
	visaBulletenTracker();
	refresh_once();
	setInterval(refresh_once, 1000 * 60 * 5); // 30 minutes
	setInterval(visaBulletenTracker, 1000 * 60 * 60); // 1 hour
}

// Clean selfCheckMemory every 5 minutes (to prevent memory leak)
setInterval(() => {
	const now = Date.now();
	for (const id in selfCheckMemory)
		if (now - selfCheckMemory[id].cached > 1000 * 60 * 5)
			delete selfCheckMemory[id];
}, 1000 * 60 * 5);
