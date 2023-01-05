import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import {tpl} from './text.js';
import {DB} from './utils/db.js';
import {getStats} from './utils/stats.js';
import moment from 'moment';
dotenv.config();

// Valid case regexp: 2023 + (EU|AF|AS|OC|SA|NA) + 1...7 digits
const CASE_REGEXP = /^2023(EU|AF|AS|OC|SA|NA)\d{1,7}$/;


const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
	const stats = await getStats();
	ctx.reply(tpl('start', ctx.from.language_code, stats));
});

bot.help(async (ctx) => {
	const {id} = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE notification_tg_id = $1', [id]);
	let currentStatus;
	if (status) {
		currentStatus = tpl('statuses.tracking', ctx.from.language_code, {
			caseNumber: status.application_id,
		});
	} else {
		currentStatus = tpl('statuses.nottracking', ctx.from.language_code);
	}
	ctx.replyWithHTML(tpl('help', ctx.from.language_code, {
		status: currentStatus,
	}))
});

bot.command('donate', (ctx) => ctx.replyWithMarkdown(tpl('donate', ctx.from.language_code)));
bot.command('stats', async (ctx) => {
	const stats = await getStats();
	ctx.replyWithHTML(tpl('stats', ctx.from.language_code, stats));
});

bot.command('remove', async (ctx) => {
	const {id} = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE notification_tg_id = $1', [id]);
	if(!status) 
		return ctx.reply(tpl('errors.caseStatusesEmpty', ctx.from.language_code));
	
	// Step 1: remove from history
	await DB.query('DELETE FROM history WHERE application_id = $1', [status.application_id]);
	// Step 2: remove from application
	const result = await DB.queryOne('DELETE FROM application WHERE notification_tg_id = $1 RETURNING *', [id]);
	if (result) {
		ctx.reply(tpl('caseRemoved', ctx.from.language_code));
	} 
		
});

bot.command('status', async (ctx) => {
	const {id} = ctx.from;
	const status = await DB.queryOne('SELECT * FROM application WHERE notification_tg_id = $1', [id]);
	if(!status) {
		return ctx.reply(tpl('errors.caseStatusesEmpty', ctx.from.language_code));
	} 
	const {application_id, status: caseStatus} = status;
	const statuses = await DB.query('SELECT * FROM history WHERE application_id = $1 ORDER BY record_id DESC', [application_id]);
	if(!statuses.length) {
		return ctx.reply(tpl('errors.caseNotTracked', ctx.from.language_code));
	}
	// build log: status (date changed)
	const latestStatus = statuses[0];

	ctx.replyWithHTML(tpl('caseStatus', ctx.from.language_code, {
		num: application_id,
		status: latestStatus.status,
		statusUpdated: new Date(latestStatus.created_at).toLocaleString(ctx.from.language_code),
		statusSince: moment(latestStatus.created_at).locale(ctx.from.language_code).fromNow(),


		checked: new Date(status.last_checked || Date.now()).toLocaleString(ctx.from.language_code),
		checkedSince: moment(status.last_checked || Date.now()).locale(ctx.from.language_code).fromNow(),
	}));
});

bot.on('text', async (ctx) => {
	const {id} = ctx.from;
	const {text} = ctx.message;
	if (!CASE_REGEXP.test(text))
		return ctx.reply(tpl('errors.invalidCaseNumber', ctx.from.language_code));
	
	const isCaseExists = await DB.queryOne('SELECT * FROM application WHERE application_id = $1', [text]);
	if (isCaseExists) {
		return ctx.reply(tpl('errors.caseAlreadyTracked', ctx.from.language_code));
	}

	// Case limit
	const casesCount = await DB.queryOne('SELECT COUNT(*) FROM application WHERE notification_tg_id = $1', [id]);
	if (casesCount.count >= 1) {
		return ctx.reply(tpl('errors.caseLimitPerUser', ctx.from.language_code));
	}

	const result = await DB.queryOne('INSERT INTO application (application_id, notification_tg_id, lang) VALUES ($1, $2, $3) RETURNING *', [text, id, ctx.from.language_code]);
	if (result) {
		ctx.reply(tpl('caseAdded', ctx.from.language_code));
	} else {
		ctx.reply(tpl('errors.caseAlreadyAdded', ctx.from.language_code));
	}
});

bot.launch();
console.log('Bot started');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));