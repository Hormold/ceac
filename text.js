const messages = {
	// Short: Bot for tracking Diversity Visa Lottery (DV) status on CEAC
	// Long description: This bot is targeted for Diversity Visa Lottery (DV) applicants. It will send you updates about your case status on CEAC.

	'cutoff': {
		'en': `Bot does not check your case because it is not in current cut off numbers (see Visa Bulletin).\nCurrent cut off numbers for your region ({region}): <b>{cutOffNumbers}</b>`,
		'ru': `Бот не проверяет ваш кейс, потому что он не в текущих номерах отсечки (смотрите Visa Bulletin).\nТекущие номера отсечки для вашего региона ({region}): <b>{cutOffNumbers}</b>`,
	},
	'start': {
		'en': `Welcome to the CEAC Tracking Bot 👋
Send me your case number and I will send you updates about your case. This bot is not affiliated with the US Government or the US Embassys.
Bot is targeted for Immigrant Visa applicants (IV) by Diversity Visa Lottery (DV).

Bot is free to use, but if you want to support the development, you can donate here: /donate
Current tracking cases: {totalCount} | Current captcha solver balance: {captchaBalance} RUB
Command list: /help
`,
		'ru': `Добро пожаловать в бота для отслеживания статуса CEAC 👋
Отправьте мне свой номер кейса (DV) и я буду отправлять вам обновления о вашем случае. Этот бот не связан с правительством США или посольствами США.
Бот предназначен для иммиграционных виз (IV) по лотерее Diversity Visa (DV).

Бот бесплатен для использования, но если вы хотите поддержать разработку, вы можете сделать пожертвование здесь: /donate
Сейчас бот отслеживает кейсов: {totalCount} | Текущий баланс решателя капчи: {captchaBalance} RUB
Список команд: /help`
	},

	'stats': {
		'ru': `Сейчас мы отслеживаем <b>{totalCount} кейсов</b>.
Детальная статистика по статусам будет доступна в ближайшее время, когда в базе накопится достаточно данных. 

Текущий баланс решателя капчи: {captchaBalance} RUB`,
		'en': `We are currently tracking <b>{totalCount} cases</b>.
Statistics by status will be available soon, when the database has enough data.

Current captcha solver balance: {captchaBalance} RUB`
	},

	'help': {
		'ru': `👋 Что-бы начать отслеживать статус вашего кейса, отправьте мне номер вашего кейса.
Я буду проверять обновления о вашем кейсе раз-два в сутки.

<b>{status}</b>

/status - Показать статус моего кейса (последнее обновление)
/stats - Показать глобальную статистику по отслеживаемым кейсам
/donate - Пожертвовать на разработку бота
/remove - Удалить мой кейс из списка отслеживаемых
/subscribe - Подписаться на рассылку о новых обновлениях визового бюллетеня ({subscribed})

🤖 Связь с разработчиком: @define
`,
		'en': `👋 To start tracking your case status, send me your case number.
I will check for updates about your case once or twice a day.

{status}

/status - Show my case status (last update)
/stats - Show global statistics about tracked cases
/donate - Donate to the bot development
/remove - Remove my case from tracking list
/subscribe - Subscribe to mailing list about new visa bulletin updates ({subscribed})

🤖 Contact with developer: @define`,
	},

	statuses: {
		'tracking': {
			'ru': '✅ Отслеживается кейс: {caseNumber}',
			'en': '✅ Tracking case: {caseNumber}'
		},
		'nottracking': {
			'ru': '❌ Еще не отслеживается кейс, отправьте мне номер вашего кейса.',
			'en': '❌ Not tracking any cases yet, send me your case number.'
		},
	},

	'donate': {
		'en': `Bot works exclusively on donations made on a voluntary basis. If you want to support the development, you can make a donation here:

Revolut tag for donate: @hormold
BTC: \`\`\`13LNDiQ8kLfqmzr83RNKE8mTj7ixCoZ7GQ\`\`\`
TRC20: \`\`\`TYJM9oCB3UUnbLLCKWtqDwEhCD5ftQeDve\`\`\`
ERC20: \`\`\`0xE25FE1178B66aAC6E0d33D9a3a6742260b5eBAAd\`\`\``,

		'ru': `Бот работает исключительно на пожертования сделаные на добровольной основе. Если вы хотите поддержать разработку бота, вы можете сделать это с помощью Revolut или карты российского банка.

Revolut тег для пожертвования: @hormold
BTC: \`\`\`13LNDiQ8kLfqmzr83RNKE8mTj7ixCoZ7GQ\`\`\`
TRC20: \`\`\`TYJM9oCB3UUnbLLCKWtqDwEhCD5ftQeDve\`\`\`
ERC20: \`\`\`0xE25FE1178B66aAC6E0d33D9a3a6742260b5eBAAd\`\`\`
Карты РФ: https://boosty.to/ceactracking`

	},

	'errors': {
		'invalidCaseNumber': {
			'en': `Invalid case number. Please, check your case number and try again.`,
			'ru': `Неверный номер кейса. Пожалуйста, проверьте номер кейса и попробуйте еще раз.`
		},
		'caseAlreadyTracked': {
			'en': `This case is already tracked. You can see the status of your case here: /status, if you didn't add it - contact the bot administrator.`,
			'ru': `Этот кейс уже отслеживается. Вы можете посмотреть статус вашего кейса здесь: /status, если вы его не добавляли - свяжитесь с администратором бота.`
		},
		'caseNotTracked': {
			'en': `This case is not yet tracked. Just wait for updates.`,
			'ru': `Этот кейс еще не отслеживается. Просто ждите обновлений.`
		},
		'caseStatusesEmpty': {
			'en': `You don't have any cases to track. You can add a case by sending me your case number.`,
			'ru': `У вас нет ни одного кейса для отслеживания. Вы можете добавить кейс, отправив мне номер вашего кейса.`
		},
		'caseLimitPerUser': {
			'en': `You can't add more than one cases per user.`,
			'ru': `К сожалению, вы не можете добавить больше одного кейса на одного пользователя.`
		},
		'remove': {
			'en': `You can't remove your case. Please, contact with developer: @define`,
			'ru': `Вы не можете удалить свой кейс. Пожалуйста, свяжитесь с разработчиком: @define`
		}
		
	},
	'caseAdded': {
		'en': `Your case has been added to the tracking list. You can see the status of your case here: /status`,
		'ru': `Ваш кейс был добавлен в список отслеживаемых. Вы можете посмотреть статус вашего кейса здесь: /status
Пожертования на работу боту принимаются тут - /donate`
	},
	'caseRemoved': {
		'en': `Your case has been removed from the tracking list. You can add it again by sending me your case number.`,
		'ru': `Ваш кейс был удален из списка отслеживаемых. Вы можете добавить его снова, отправив мне номер вашего кейса.`
	},
	'caseRemoveSure': {
		'en': `Are you sure you want to remove your case from the tracking list?\n\n<i>NOTE: You can add it again by sending me your case number.</i>\nI'm sure: /removeSure`,
		'ru': `Вы уверены, что хотите удалить свой кейс из списка отслеживаемых?\n\n<i>ПРИМЕЧАНИЕ: Вы можете добавить его снова, отправив мне номер вашего кейса.</i>\nЯ уверен: /removeSure`
	},
	'caseStatus': {
		'en': `Your case - <i>{num}</i>
{cutOffString}
Last checked: {checked} ({checkedSince})
Last change: {statusUpdated} ({statusSince})

Status is: <b>{status}</b>
Manual check: https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV`,
		'ru': `Ваш кейс - <i>{num}</i>
{cutOffString}
Последняя проверка: {checked} ({checkedSince})
Последнее изменение: {statusUpdated} ({statusSince})

Статус: <b>{status}</b> 
Ручная проверка: https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV`
	},

	'update': {
		'en': `⚠️ Your case ({num}) status has been updated: <b>{status}</b>`,
		'ru': `⚠️ Статус вашего кейса ({num}) был обновлен: <b>{status}</b>`
	},

	'bul': {
		'unsbscribed': {
			'en': `✅ You have been unsubscribed from the updates of the visa bulletin.`,
			'ru': `✅ Вы были отписаны от обновлений визового бюллетеня.`
		},
		'subscribed': {
			'en': `❌ You have been subscribed to the updates of the visa bulletin.`,
			'ru': `❌ Вы были подписаны на обновления визового бюллетеня.`
		},
		'status_ok': {
			'en': '✅ subscribed',
			'ru': '✅ подписан'
		},
		'status_not_ok': {
			'en': '❌ not subscribed',
			'ru': '❌ не подписан'
		},
	},

	'bul_update': {
		'en': `⚠️ Visa bulletin has been updated.\nLink to the bulletin: {url}`,
		'ru': `⚠️ Визовый бюллетень был обновлен.\nСсылка на бюллетень: {url}`
	},

}

export const tpl = (key, lang = 'en', data = {}) => {
	let text;
	if(key.match(/\./)) {
		const keys = key.split('.');
		let v;
		for(let i = 0; i < keys.length; i++)
			v = v ? v[keys[i]] : messages[keys[i]];
		if(!v[lang])
			text = v['en'];
		else
			text = v[lang];
	}else{
		if(!messages[key][lang])
			text = messages[key]['en'];
		else
			text = messages[key][lang];
	}

	for(let k in data)
		text = text.replace(new RegExp(`{${k}}`, 'g'), data[k]);

	if(!text) {
		console.log(`No text for key: ${key}`);
		return '';
	}
	return text;
};