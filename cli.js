#!/usr/bin/env node

// Copyright 2019 Google Inc.
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

const osChoices = [
	{ name: 'macOS 64-bit',     value: 'mac64'    },
	{ name: 'macOS M1 64-bit',  value: 'mac64arm' },
	{ name: 'Linux 32-bit',     value: 'linux32'  },
	{ name: 'Linux 64-bit',     value: 'linux64'  },
	{ name: 'Windows 32-bit',   value: 'win32'    },
	{ name: 'Windows 64-bit',   value: 'win64'    },
];

const guessOs = () => {
	const platform = getPlatform();
	if (platform === 'mac') {
		if (os.arch() === 'arm64') {
			return 'mac64arm';
		}
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
		choices: osChoices,
		default: guessOs(),
	});
};

const engineChoices = [
	{
		name: 'Chakra/ChakraCore',
		value: 'chakra',
		checked: true,
	},
	{
		name: 'GraalJS',
		value: 'graaljs',
		checked: true,
	},
	{
		name: 'Hermes',
		value: 'hermes',
		checked: true,
	},
	{
		name: 'JavaScriptCore',
		value: 'javascriptcore',
		checked: true,
	},
	{
		name: 'QuickJS',
		value: 'quickjs',
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
	{
		name: 'V8 debug',
		value: 'v8-debug',
		checked: false,
	},
	{
		name: 'XS',
		value: 'xs',
		checked: true,
	},
];

const promptEngines = () => {
	return inquirer.prompt({
		name: 'step',
		type: 'checkbox',
		message: 'Which JavaScript engines would you like to install?',
		choices: engineChoices,
	});
};

(async () => {

	log.banner(pkg.version);

	// Warn if an update is available.
	updateNotifier({ pkg }).notify();

	// Read the user configuration + CLI arguments, and prompt for any
	// missing info.
	const status = getStatus();

	const args = process.argv.slice(2);
	for (const arg of args) {
		if (arg.startsWith('--os=')) {
			const os = arg.split('=')[1];
			status.os = os === 'default' ? guessOs() : os;
		}
		else if (arg.startsWith('--engines=')) {
			const enginesArg = arg.split('=')[1];
			const engines = enginesArg === 'all' ?
				engineChoices.filter(choice => choice.checked).map(choice => choice.value) :
				enginesArg.split(',');
			status.engines = engines;
		}
		else if (arg.includes('@')) {
			const [engine, version] = arg.split('@');
			status.engine = engine;
			status.version = version;
		}
		else {
			const wantsHelp = arg === '--help' || arg === '-h';
			if (!wantsHelp) {
				console.error('\nUnrecognized argument: ' + JSON.stringify(arg) + '\n');
			}
			console.log('[<engine>@<version>]');
			console.log(`[--os={${ osChoices.map(choice => choice.value).join(',') },default}]`);
			console.log(`[--engines={${ engineChoices.map(choice => choice.value).join(',') }},…]`);

			console.log('\nComplete documentation is online:');
			console.log('https://github.com/GoogleChromeLabs/jsvu#readme');
			return;
		}
	}

	if (status.os === undefined) {
		status.os = (await promptOs()).step;
		setStatus(status);
	} else {
		log.success(`Read OS from config: ${status.os}`);
	}

	// The user provided a specific engine + version, e.g. `jsvu v8@7.2`.
	if (status.engine && status.version) {
		const { engine, version } = status;
		log.success(`Read engine + version from CLI argument: ${engine} v${
			version}`);
		const installSpecificEngineVersion =
			require('./shared/install-specific-version.js');
		await installSpecificEngineVersion({
			...require(`./engines/${engine}/index.js`),
			status: status,
		});
		return;
	}

	// The user wants to install or update engines, but we don’t know
	// which ones.
	if (status.engines === undefined || status.engines.length === 0) {
		status.engines = (await promptEngines()).step;
		if (status.engines.length === 0) {
			log.failure('No JavaScript engines selected. Nothing to do…');
		}
		setStatus(status);
	} else {
		log.success(`Read engines from config: ${status.engines.join(', ')}`);
	}

	// Install the desired JavaScript engines.
	const updateEngine = require('./shared/engine.js');
	for (const engine of status.engines) {
		await updateEngine({
			status: status,
			...require(`./engines/${engine}/index.js`),
		});
	}

})();
