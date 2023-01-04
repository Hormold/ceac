const messages = {
	// Short: Bot for tracking Diversity Visa Lottery (DV) status on CEAC
	// Long description: This bot is targeted for Diversity Visa Lottery (DV) applicants. It will send you updates about your case status on CEAC.
	'start': {
		'en': `Welcome to the CEAC Tracking Bot!
Send me your case number and I will send you updates about your case. This bot is not affiliated with the US Government or the US Embassys.
Bot is targeted for Immigrant Visa applicants (IV) by Diversity Visa Lottery (DV).

Bot is free to use, but if you want to support the development, you can donate here: /donate
Current tracking cases: {totalCount} | Current captcha solver balance: {captchaBalance} RUB
Command list: /help
`,
		'ru': `Добро пожаловать в бота для отслеживания статуса CEAC!
Отправьте мне свой номер кейса (DV) и я буду отправлять вам обновления о вашем случае. Этот бот не связан с правительством США или посольствами США.
Бот предназначен для иммиграционных виз (IV) по лотерее Diversity Visa (DV).

Бот бесплатен для использования, но если вы хотите поддержать разработку, вы можете сделать пожертвование здесь: /donate
Сейчас бот отслеживает кейсов: {totalCount} | Текущий баланс решателя капчи: {captchaBalance} RUB
Список команд: /help`
	},

	'stats': {
		'ru': `Сейчас мы отслеживаем {totalCount} кейсов. Детальная статистика по статусам будет доступна в ближайшее время, когда в базе накопится достаточно данных. 
Текущий баланс решателя капчи: {captchaBalance} RUB`,
		'en': `We are currently tracking {totalCount} cases. Statistics by status will be available soon, when the database has enough data.
Current captcha solver balance: {captchaBalance} RUB`
	},

	'help': {
		'ru': `Что-бы начать отслеживать статус вашего кейса, отправьте мне номер вашего кейса.
Я буду проверять обновления о вашем кейсе раз-два в сутки.

{status}

/status - Показать статус моего кейса (последнее обновление)
/remove - Удалить мой кейс из списка отслеживаемых
/donate - Пожертвовать на разработку бота
/stats - Показать глобальную статистику по отслеживаемым кейсам

Связь с разработчиком: @define
`,
		'en': `To start tracking your case status, send me your case number.
I will check for updates about your case once or twice a day.

{status}

/status - Show my case status (last update)
/remove - Remove my case from tracking list
/donate - Donate to the bot development
/stats - Show global statistics about tracked cases

Contact with developer: @define`,
	},

	statuses: {
		'tracking': {
			'ru': 'Отслеживается кейс: **{caseNumber}**',
			'en': 'Tracking case: **{caseNumber}**'
		},
		'nottracking': {
			'ru': 'Еще не отслеживается кейс, отправьте мне номер вашего кейса.',
			'en': 'Not tracking any cases yet, send me your case number.'
		},
	},

	'donate': {
		'en': `Revolut tag for donate: @hormold
BTC: 13LNDiQ8kLfqmzr83RNKE8mTj7ixCoZ7GQ
TRC20: TYJM9oCB3UUnbLLCKWtqDwEhCD5ftQeDve
ERC20: 0xE25FE1178B66aAC6E0d33D9a3a6742260b5eBAAd`,

		'ru': `Revolut тег для пожертвования: @hormold
BTC: 13LNDiQ8kLfqmzr83RNKE8mTj7ixCoZ7GQ
TRC20: TYJM9oCB3UUnbLLCKWtqDwEhCD5ftQeDve
ERC20: 0xE25FE1178B66aAC6E0d33D9a3a6742260b5eBAAd
Русские карты: https://boosty.to/ceactracking`

	},

	'errors': {
		'invalidCaseNumber': {
			'en': `Invalid case number. Please, check your case number and try again.`,
			'ru': `Неверный номер кейса. Пожалуйста, проверьте номер кейса и попробуйте еще раз.`
		},
		'caseAlreadyTracked': {
			'en': `This case is already tracked. You can see the status of your case here: /status`,
			'ru': `Этот кейс уже отслеживается. Вы можете посмотреть статус вашего кейса здесь: /status`
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
	'caseStatus': {
		'en': `Your case - {num}
Last update: {updated}

Status is: {status}`,
		'ru': `Ваш кейс - {num}
Последнее обновление: {updated}

Статус: {status}`
	},

	'update': {
		'en': `Your case ({num}) status has been updated: {status}`,
		'ru': `Статус вашего кейса ({num}) был обновлен: {status}`
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