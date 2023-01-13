# WIP: CEAC Tracking bot
This bot is used to track the CEAC status of a DV case. It will send a message to a channel when the status changes.

Disclaimer: I am not responsible for any misuse of this bot. Use it at your own risk. I am not affiliated with the US government. This is a personal project. 
Work in progress on this project, so expect bugs.

## Requirements:
- Node.js >= 16
- PostgreSQL (needed to store the user data)
- Telegram bot token (get it from [@BotFather](https://t.me/BotFather))
- Rucaptcha key (get it from [Rucaptcha](https://rucaptcha.com/))

## Features
- Track multiple cases
- Tracking Visa Bulletin updates

# SQL Schema
The SQL schema is located in `sql/schema.sql`
You can create the database with the following command:
```
psql -U postgres -h localhost -f sql/schema.sql
```

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Add a `.env` file with the following variables:
```
BOT_TOKEN=YOUR_BOT_TOKEN
POSTGRES_URL=postgress://USER:PASSWORD@HOST:PORT/DATABASE
RUCAPTCHA_KEY=A_RUCAPTCHA_KEY
```
4. Create the database and run the SQL schema (see above)
5. Create dir tmp in the root of the project and give it write permissions
6. Run the bot with `npm start`


## Demo
[@CEACTrackingBot](https://t.me/CEACTrackingBot)
