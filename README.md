# CEAC Tracking bot
This bot is used to track the CEAC status of a DV case. It will send a message to a channel when the status changes.

Requirements:
- Node.js >= 16
- PostgreSQL
- Telegram bot token


## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Add a `.env` file with the following variables:
```
BOT_TOKEN=YOUR_BOT_TOKEN
POSTGRES_URL=postgress://USER:PASSWORD@HOST:PORT/DATABASE
RUCAPTCHA_KEY=A_RUCAPTCHA_KEY
```

4. Run the bot with `npm start`
