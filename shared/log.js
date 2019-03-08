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

const chalk = require('chalk');

const log = {
	failure: (message) => {
		console.log(`${chalk.red('✖')} ${message}`);
	},
	start: (message) => {
		console.log(`${chalk.yellow('❯')} ${message}`);
	},
	success: (message) => {
		console.log(`${chalk.green('✔')} ${message}`);
	},
	updateSuccess: (message) => {
		console.log(`\x1B[1A\x1B[K${chalk.green('✔')} ${message}`);
	},
	banner: (version) => {
		const highlight = chalk.bold.hex('#859901');
		console.log(`📦 jsvu v${version} — the ${highlight('J')}ava${
			highlight('S')}cript engine ${highlight('V')}ersion ${
			highlight('U')}pdater 📦`);
	},
};

module.exports = log;
