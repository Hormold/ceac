import dotenv from 'dotenv';
import { resolve_captcha } from '../utils/captcha.js';
import fs from 'fs';
dotenv.config();
// Read captcha images dir (dataset)
const dir = '../tmp/dataset';
let images = [];
const databaseFile = '../tmp/database' + Date.now() + '.json';
const tmpBase = {};
let i = 0;

const updateFiles = () => {
	const files = fs.readdirSync(dir);
	images = files.filter(file => file.endsWith('.jpeg'));
};

const takeRandomFile = () => images[Math.floor(Math.random() * images.length)];

const solveCaptcha = async fileName => {
	try {
		const file = dir + '/' + fileName;
		const captcha = fs.readFileSync(file);
		const base64 = captcha.toString('base64');
		const result = (await resolve_captcha(base64, 60)).toUpperCase();
		console.log(`Solved ${fileName} as ${result}`);
		const oldName = fileName.replace('.jpeg', '');
		const newName = `${result}_${oldName}.jpg`;
		// Move file to solved dir
		fs.rename('./' + file, '../tmp/train/' + newName, err => {
			if (err)
				console.log(`Error: ${err.message} #${fileName}`);
		});
		// Save to database
		tmpBase[newName] = result;
		fs.writeFileSync(databaseFile, JSON.stringify(tmpBase));

		// Refresh file list
		updateFiles();
	} catch (e) {
		console.log(`Error: ${e.message} #${fileName}`);
	}
};

const main = async () => {
	// Run asynchrnously in 5 threads
	const threads = 15;
	const promises = [];
	for (let i = 0; i < threads; i++) {
		const file = takeRandomFile();
		promises.push(solveCaptcha(file));
	}
	await Promise.all(promises);
	// sleep for 5 seconds
	console.log(`Finished iteration #${i}`);
	await new Promise(resolve => setTimeout(resolve, 5000));
	
	i++;
	main();
};

updateFiles();
main();
