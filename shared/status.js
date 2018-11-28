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

const fs = require('fs');

const mkdirp = require('mkdirp');

const config = require('../shared/config.js');
const jsvuPath = config.path;

const statusFilePath = `${jsvuPath}/status.json`;

const getConfigFromFile = () => {
	try {
		return require(statusFilePath);
	} catch (error) {
		return {};
	}
}

const getStatus = () => {
	const status = {};
	const args = process.argv.slice(2);
	for (const arg of args) {
		if (arg.startsWith('--os=')) {
			const os = arg.split('=')[1];
			status.os = os;
		}
		else if (arg.startsWith('--engines=')) {
			const enginesArg = arg.split('=')[1];
			const engines = enginesArg === 'all' ?
				['chakra', 'javascriptcore', 'spidermonkey', 'v8', 'xs'] :
				enginesArg.split(',');
			status.engines = engines;
		}
	}
	if (status.os && status.engines) {
		return status;
	}
	if (status.engines) {
		return { ...getConfigFromFile(), engines: status.engines };
	}
	return getConfigFromFile();
};

const setStatus = (status) => {
	mkdirp.sync(jsvuPath);
	fs.writeFileSync(statusFilePath, JSON.stringify(status, null, '\t'));
};

module.exports = {
	getStatus,
	setStatus,
};
