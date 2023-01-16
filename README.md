# WIP: CEAC Tracking bot
This bot is used to track the CEAC status of a DV case (Immigrant Visa by Diversity Lottery).
It will send a message to a private messages when the status changes. 

Disclaimer: 
> *I am not responsible for any misuse of this bot. Use it at your own risk. I am not affiliated with the US government. This is a personal project.*
> Work in progress on this project, so expect bugs.

## Requirements
- Node.js >= 16 (Uses fetch API)
- PostgreSQL (needed to store the user data: case id, history, etc)

## Need to get before run
- Telegram bot token (get it from [@BotFather](https://t.me/BotFather))
- Rucaptcha key (get it from [Rucaptcha](https://rucaptcha.com?from=1626417)), needed to solve the captcha (can topup with debit card, crypto, etc)
- Telegram ID of admin account (get it from [@RawDataBot](https://t.me/RawDataBot) -> message>from>id)
- Check actual cut-off numbers for current month (See latest [Visa Bulletin](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html)) and edit in `cut_off_numbers.js`

## Features
- Track one case per user
- Tracking Visa Bulletin updates (and notify users when updated)
- Self checking for updates by entering captcha by user

## SQL Schema
The SQL schema is located in `sql/schema.sql`
You can create the database with the following command:
```
psql -U postgres -h localhost -f sql/schema.sql
```

## Installation (manually)

1. Clone the repository
2. Install dependencies with `npm install`
3. Add a `.env` file with the following variables:
```
BOT_TOKEN=YOUR_BOT_TOKEN
POSTGRES_URL=postgress://USER:PASSWORD@HOST:PORT/DATABASE
RUCAPTCHA_KEY=A_RUCAPTCHA_KEY
ADMIN_ID=TG_ADMIN_ID
```
4. Create the database and run the SQL schema (see above)
5. Run the bot with `npm start`

## Installation (Docker)
1. Clone the repository
2. Build the image with `docker build -t ceac-tracking-bot .`
3. Add `.env` file with the same variables as above
4. Create the database and run the SQL schema (see above)
5. Run the container with `docker run -d --name ceac-tracking-bot ceac-tracking-bot`
6. To stop the container, run `docker stop ceac-tracking-bot`


## Demo
[@CEACTrackingBot](https://t.me/CEACTrackingBot) - this bot is free to use, but I can't guarantee that it will be online 24/7. 