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

const execa = require('execa');
const tempy = require('tempy');

const config = require('../../shared/config.js');
const jsvuPath = config.path;

const test = async ({ binary }) => {
	const path = tempy.file();
	const program = `print('Hi!');\n`;
	fs.writeFileSync(path, program);
	console.assert(
		(await execa(`${jsvuPath}/${binary}`, [path])).stdout === 'Hi!'
	);
	console.assert(
		(await execa(`${jsvuPath}/${binary}`, ['-e', program])).stdout === 'Hi!'
	);
};

module.exports = test;
