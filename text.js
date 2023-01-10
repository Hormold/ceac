const messages = {
	// Short: Bot for tracking Diversity Visa Lottery (DV) status on CEAC
	// Long description: This bot is targeted for Diversity Visa Lottery (DV) applicants. It will send you updates about your case status on CEAC.

	'cutoff': {
		'en': `Bot does not check your case because it is not in current cut off numbers (see Visa Bulletin).\nCurrent cut off numbers for your region ({region}): <b>{cutOffNumbers}</b>`,
		'ru': `Бот не проверяет ваш кейс, потому что он не в текущих номерах отсечки (смотрите Visa Bulletin).\nТекущие номера отсечки для вашего региона ({region}): <b>{cutOffNumbers}</b>`,
		'uz': `Bot sizning kasingizni tekshirmaydi, chunki uni joriy chegaralarda emas (Visa Bulletin-ni ko'ring).\nJoriy chegaralardagi sizning hududingiz uchun chegaralar: <b>{cutOffNumbers}</b>`,
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
Список команд: /help`,
'uz': `CEAC holatini kuzatish botiga xush kelibsiz 👋
Menga ish raqamingizni (DV) yuboring va men sizga ishingiz bo‘yicha yangilanishlarni yuboraman. Bu bot AQSh hukumati yoki AQSh elchixonalariga aloqador emas.
Bot Diversity Visa (DV) lotereyasi bo‘yicha immigratsion vizalar (IV) uchun mo‘ljallangan.

Botdan foydalanish bepul, lekin agar siz ishlanmani qo‘llab-quvvatlamoqchi bo‘lsangiz, bu yerda xayriya qilishingiz mumkin: /donate
Endi bot holatlarni kuzatmoqda: {totalCount} | Captcha hal qiluvchi joriy balansi: {captchaBalance} RUB
Buyruqlar ro'yxati: /help`,
	},

	'stats': {
		'ru': `Сейчас мы отслеживаем <b>{totalCount} кейсов</b>.
Детальная статистика по статусам будет доступна в ближайшее время, когда в базе накопится достаточно данных. 

Текущий баланс решателя капчи: {captchaBalance} RUB`,
		'en': `We are currently tracking <b>{totalCount} cases</b>.
Statistics by status will be available soon, when the database has enough data.

Current captcha solver balance: {captchaBalance} RUB`,
		'uz': `Hozirda <b>{totalCount} ta holat</b> kuzatilmoqda.
Statuslar bo'yicha batafsil statistik ma'lumotlar ma'lumotlar bazasida yetarlicha ma'lumotlar to'plangandan so'ng, yaqin kelajakda mavjud bo'ladi.

Captcha hal qiluvchi joriy balansi: {captchaBalance} RUB`
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
		'uz': `👋 Ishingiz holatini kuzatishni boshlash uchun menga ish raqamingizni yuboring.
Men kuniga bir yoki ikki marta ishingizga oid yangilanishlarni tekshiraman.

<b>{status}</b>

/status - Mening ishim holatini ko'rsatish (oxirgi yangilangan)
/stats - Kuzatiladigan holatlar uchun global statistikani ko'rsatish
/donate - Bot rivojlanishiga xayriya qiling
/remove - Mening ishimni kuzatuv ro'yxatidan olib tashlang
/subscribe - Viza byulletenining yangi yangiliklari haqidagi axborot byulleteniga obuna bo'ling ({obuna bo'lgan})

🤖 Dasturchi bilan bog'lanish: @define`
	},

	statuses: {
		'tracking': {
			'ru': '✅ Отслеживается кейс: {caseNumber}',
			'en': '✅ Tracking case: {caseNumber}',
			'uz': '✅ Ishni kuzatish: {caseNumber}'
		},
		'nottracking': {
			'ru': '❌ Еще не отслеживается кейс, отправьте мне номер вашего кейса.',
			'en': '❌ Not tracking any cases yet, send me your case number.',
			'uz': '❌ Hali hech qanday ishni kuzatmayman, ish raqamingizni yuboring.'
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
			'ru': `Неверный номер кейса. Пожалуйста, проверьте номер кейса и попробуйте еще раз.`,
			'uz': `Noto'g'ri ish raqami. Iltimos, ish raqamingizni tekshiring va qayta urinib ko'ring.`
		},
		'caseAlreadyTracked': {
			'en': `This case is already tracked. You can see the status of your case here: /status, if you didn't add it - contact the bot administrator.`,
			'ru': `Этот кейс уже отслеживается. Вы можете посмотреть статус вашего кейса здесь: /status, если вы его не добавляли - свяжитесь с администратором бота.`,
			'uz': `Bu ish allaqachon kuzatilmoqda. Siz ish holatini quyidagi joyda ko'ra olasiz: /status, agar siz uni qo'shmasangiz - bot administrator bilan bog'laning.`
		},
		'caseNotTracked': {
			'en': `This case is not yet tracked. Just wait for updates.`,
			'ru': `Этот кейс еще не отслеживается. Просто ждите обновлений.`,
			'uz': `Bu ish hali kuzatilmaydi. O'zgartirishlarni kutib turing.`
		},
		'caseStatusesEmpty': {
			'en': `You don't have any cases to track. You can add a case by sending me your case number.`,
			'ru': `У вас нет ни одного кейса для отслеживания. Вы можете добавить кейс, отправив мне номер вашего кейса.`,
			'uz': `Siz kuzatish uchun hech qanday ish yo'q. Siz ish raqamingizni yuboring`
		},
		'caseLimitPerUser': {
			'en': `You can't add more than one cases per user.`,
			'ru': `К сожалению, вы не можете добавить больше одного кейса на одного пользователя.`,
			'uz': `Uzr so'raymiz, siz faqat bir foydalanuvchi uchun bir nechta ish qo'shishingiz mumkin emas.`
		},
		'remove': {
			'en': `You can't remove your case. Please, contact with developer: @define`,
			'ru': `Вы не можете удалить свой кейс. Пожалуйста, свяжитесь с разработчиком: @define`,
			'uz': `Siz o'zingizni ishni o'chirib bo'lmaysiz. Iltimos, dasturchi bilan bog'laning: @define`
		}
		
	},
	'caseAdded': {
		'en': `Your case has been added to the tracking list. You can see the status of your case here: /status`,
		'ru': `Ваш кейс был добавлен в список отслеживаемых. Вы можете посмотреть статус вашего кейса здесь: /status
Пожертования на работу боту принимаются тут - /donate`,
		'uz': `Sizning ishingiz kuzatish ro'yxatiga qo'shildi. Siz ish holatini quyidagi joyda ko'ra olasiz: /status
Bot ishini davom ettirish uchun do'konimizga pul yuborishingiz mumkin - /donate`
	},
	'caseRemoved': {
		'en': `Your case has been removed from the tracking list. You can add it again by sending me your case number.`,
		'ru': `Ваш кейс был удален из списка отслеживаемых. Вы можете добавить его снова, отправив мне номер вашего кейса.`,
		'uz': `Sizning ishingiz kuzatish ro'yxatidan o'chirildi. Siz uni qayta qo'shishingiz mumkin, ish raqamingizni yuboring.`
	},
	'caseRemoveSure': {
		'en': `Are you sure you want to remove your case from the tracking list?\n\n<i>NOTE: You can add it again by sending me your case number.</i>\nI'm sure: /removeSure`,
		'ru': `Вы уверены, что хотите удалить свой кейс из списка отслеживаемых?\n\n<i>ПРИМЕЧАНИЕ: Вы можете добавить его снова, отправив мне номер вашего кейса.</i>\nЯ уверен: /removeSure`,
		'uz': `Siz ishni kuzatish ro'yxatidan o'chirishni istaysizmi?\n\n<i>QAYD: Siz uni qayta qo'shishingiz mumkin, ish raqamingizni yuboring.</i>\nMen ishonaman: /removeSure`
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
		'ru': `⚠️ Статус вашего кейса ({num}) был обновлен: <b>{status}</b>`,
		'uz': `⚠️ Sizning ishingiz ({num}) holati yangilandi: <b>{status}</b>`
	},

	'bul': {
		'unsbscribed': {
			'en': `✅ You have been unsubscribed from the updates of the visa bulletin.`,
			'ru': `✅ Вы были отписаны от обновлений визового бюллетеня.`,
			'uz': `✅ Siz viza bulyeteni yangilanishlari haqida obuna bo'lmadingiz.`
		},
		'subscribed': {
			'en': `❌ You have been subscribed to the updates of the visa bulletin.`,
			'ru': `❌ Вы были подписаны на обновления визового бюллетеня.`,
			'uz': `❌ Siz viza bulyeteni yangilanishlari haqida obuna bo'ldingiz.`
		},
		'status_ok': {
			'en': '✅ subscribed',
			'ru': '✅ подписан',
			'uz': '✅ obuna bo\'ldi',
		},
		'status_not_ok': {
			'en': '❌ not subscribed',
			'ru': '❌ не подписан',
			'uz': '❌ obuna bo\'lmadi'
		},
	},

	'bul_update': {
		'en': `⚠️ Visa bulletin has been updated.\nLink to the bulletin: {url}`,
		'ru': `⚠️ Визовый бюллетень был обновлен.\nСсылка на бюллетень: {url}`
	},

	'current_cut_off': {
		'en': `Current cut-off numbers > EU - {EU} | AS - {AS} | AF - {AF} | OC - {OC} | SA - {SA} | NA - {NA}`,
		'ru': `Текущие cut-off номера > EU - {EU} | AS - {AS} | AF - {AF} | OC - {OC} | SA - {SA} | NA - {NA}`,
		'uz': `Joriy cut-off raqamlari > EU - {EU} | AS - {AS} | AF - {AF} | OC - {OC} | SA - {SA} | NA - {NA}`
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