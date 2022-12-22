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

const fs = require('fs');

const mkdirp = require('mkdirp');

const config = require('../shared/config.js');
const jsvuPath = config.path;
const jsvuBinPath = config.binPath;

const statusFilePath = `${jsvuPath}/status.json`;

const getStatus = () => {
	try {
		// Upgrade existing, old installations.
		mkdirp.sync(jsvuBinPath);
		return require(statusFilePath);
	} catch (error) {
		return {};
	}
};

const setStatus = (status) => {
	mkdirp.sync(jsvuBinPath);
	// Don’t store one-off CLI args in the persistent configuration.
	const statusCopy = { ...status };
	delete statusCopy.engine;
	delete statusCopy.version;
	fs.writeFileSync(
		statusFilePath,
		JSON.stringify(statusCopy, null, '\t')
	);
};

module.exports = {
	getStatus,
	setStatus,
};
