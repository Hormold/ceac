// This module provides a simple logger for the application.
const ENABLE_COLORS = true;
// Not use winston because it is too heavy for this simple application.
const getTS = () => {
	const date = new Date();
	// Get TS in format HH:MM:SS
	return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};
export const log = message => {
	if (ENABLE_COLORS)
		console.log(`\x1b[32m${getTS()}\x1b[0m - ${message}`);
	else
		console.log(`${getTS()} - ${message}`);
};
