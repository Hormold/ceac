export const resolve_captcha = async (base64, maxTrys = 15) => {
	const key = process.env.RUCAPTCHA_KEY;
	const url = 'http://rucaptcha.com/in.php';
	const params = {
		key,
		method: 'base64',
		body: base64,
		json: 1,
	};
	const response = await fetch(url, {
		method: 'POST',
		body: new URLSearchParams(params),
	});
	const data = await response.json();
	if (data.status !== 1)
		throw new Error(data.request);
	
	const captcha_id = data.request;
	// console.log(`[CAPTCHA] Captcha ID: ${captcha_id} (maxTrys: ${maxTrys}), waiting for response...`);
	const captcha_url = `http://rucaptcha.com/res.php?key=${key}&action=get&id=${captcha_id}&json=1`;
	let captcha_response;
	for (let i = 0; i < maxTrys; i++) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		const response = await fetch(captcha_url);
		const data = await response.json();
		if (data.status === 1) {
			captcha_response = data.request;
			break;
		}
	}
	if (!captcha_response)
		throw new Error('Captcha not resolved');
	
	return captcha_response;
};
