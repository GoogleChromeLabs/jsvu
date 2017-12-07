#!/usr/bin/env node

// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// <https://apache.org/licenses/LICENSE-2.0>.
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const os = require('os');

const inquirer = require('inquirer');
const updateNotifier = require('update-notifier');

const pkg = require('./package.json');
const log = require('./shared/log.js');
const { getStatus, setStatus } = require('./shared/status.js');

const getPlatform = () => {
	const platform = os.platform();
	switch (platform) {
		case 'darwin': {
			return 'mac';
		}
		case 'win32': {
			return 'win';
		}
		default: {
			return 'linux';
		}
	}
};

const guessOs = () => {
	const platform = getPlatform();
	if (platform === 'mac') {
		return 'mac64';
	}
	// Note: `os.arch()` returns the architecture of the Node.js process,
	// which does not necessarily correspond to the system architecture.
	// Still, if the user runs a 64-bit version of Node.js, it’s safe to
	// assume the underlying architecture is 64-bit as well.
	// https://github.com/nodejs/node/issues/17036
	const arch = os.arch().includes('64') ? '64' : '32';
	const identifier = `${platform}${arch}`;
	return identifier;
};

const promptOs = () => {
	return inquirer.prompt({
		name: 'step',
		type: 'list',
		message: 'What is your operating system?',
		choices: [
			{ name: 'macOS 64-bit',   value: 'mac64'   },
			{ name: 'Linux 32-bit',   value: 'linux32' },
			{ name: 'Linux 64-bit',   value: 'linux64' },
			{ name: 'Windows 32-bit', value: 'win32'   },
			{ name: 'Windows 64-bit', value: 'win64'   },
		],
		default: guessOs(),
	});
};

const promptEngines = () => {
	return inquirer.prompt({
		name: 'step',
		type: 'checkbox',
		message: 'Which JavaScript engines would you like to install?',
		choices: [
			{
				name: 'Chakra/ChakraCore',
				value: 'chakra',
				checked: true,
			},
			{
				name: 'JavaScriptCore',
				value: 'javascriptcore',
				checked: true,
			},
			{
				name: 'SpiderMonkey',
				value: 'spidermonkey',
				checked: true,
			},
			{
				name: 'V8',
				value: 'v8',
				checked: true,
			},
		],
	});
};

(async () => {

	log.banner(pkg.version);

	// Warn if an update is available.
	updateNotifier({ pkg }).notify();

	// Read the user configuration, and prompt for any missing info.
	const status = getStatus();
	if (status.os === undefined) {
		status.os = (await promptOs()).step;
		setStatus(status);
	} else {
		log.success(`Read OS from config: ${status.os}`);
	}
	if (status.engines === undefined || status.engines.length === 0) {
		status.engines = (await promptEngines()).step;
		setStatus(status);
	} else {
		log.success(`Read engines from config: ${status.engines.join(', ')}`);
	}

	// Install the desired JavaScript engines.
	for (const engine of status.engines) {
		await require(`./engines/${engine}/index.js`);
	}

})();
