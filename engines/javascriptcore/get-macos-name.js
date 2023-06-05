'use strict';

const { execSync } = require('node:child_process');

const SEARCH_PATTERN = 'SOFTWARE LICENSE AGREEMENT FOR macOS';
const LICENSE_FILE_PATH =
	'/System/Library/CoreServices/Setup Assistant.app/Contents/Resources/en.lproj/OSXSoftwareLicense.rtf';

const getMacOsName = () => {
	const cmd = `awk '/${SEARCH_PATTERN}/' '${LICENSE_FILE_PATH}'`;
	const stdout = execSync(cmd).toString();
	let name = stdout.substring(stdout.indexOf(SEARCH_PATTERN) + SEARCH_PATTERN.length);
	name = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
	return name;
};

module.exports = getMacOsName;
