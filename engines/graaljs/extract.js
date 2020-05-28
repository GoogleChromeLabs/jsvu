// Copyright 2020 Google Inc.
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

const path = require('path');
const fs = require('fs');

const tar = require('tar');

const { Installer } = require('../../shared/installer.js');
const unzip = require('../../shared/unzip.js');

const extract = ({ filePath, binary, alias, os }) => {
	return new Promise(async (resolve, reject) => {
		const tmpPath = path.dirname(filePath);
		if (os.startsWith('win')) {
			await unzip({
				from: filePath,
				to: tmpPath,
			});
		} else {
			await tar.extract({
				file: filePath,
				cwd: tmpPath,
			});
		}
		const installer = new Installer({
			engine: binary,
			path: tmpPath,
		});
		switch (os) {
			case 'mac64':
			case 'linux64': {
				const directoryName = fs.readdirSync(tmpPath).find(file => file.startsWith('graaljs'));
				const executableName = `${directoryName}/bin/js`;
				installer.installBinary({ [executableName]: binary });
				break;
			}
			case 'win64': {
				const directoryName = fs.readdirSync(tmpPath).find(file => file.startsWith('graaljs'));
				const executableName = `${directoryName}\\bin\\js.exe`;
				installer.installBinary(
					{ [executableName]: `${binary}.exe` },
					{ symlink: false }
				);
				installer.installScript({
					name: `${binary}.cmd`,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\${binary}.exe" %*
						`;
					}
				});
				break;
			}
		}
		resolve();
	});
};

module.exports = extract;
