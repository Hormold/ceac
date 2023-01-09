export const sendMessage = async (chatId, text, options = {}) => {
	const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
	const res = await fetch(url, {
		method: "POST",
		body: new URLSearchParams({
			chat_id: chatId,
			text: text,
			parse_mode: 'HTML',
			...options
		}),
	});
	const data = await res.json();
	if(!data.ok)
		console.log(`Error sending message to ${chatId}: ${data.description}`)
	return data;
};