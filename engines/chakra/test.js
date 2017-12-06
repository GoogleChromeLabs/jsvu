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

const execa = require('execa');
const tempy = require('tempy');

const config = require('../../shared/config.js');
const jsvuPath = config.path;

const test = async (os) => {
	const path = tempy.file();
	const suffix = os.startsWith('win') ? '.exe' : '';
	fs.writeFileSync(path, `print('Hi!');\n`);
	console.assert(
		(await execa(`${jsvuPath}/chakra${suffix}`, [path])).stdout === 'Hi!'
	);
	console.assert(
		(await execa(`${jsvuPath}/ch${suffix}`, [path])).stdout === 'Hi!'
	);
};

module.exports = test;
