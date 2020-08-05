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

const path = require('path');

const tar = require('tar');

const { Installer } = require('../../shared/installer.js');

const extract = ({ filePath, binary, alias, os }) => {
	return new Promise(async (resolve, reject) => {
		const tmpPath = path.dirname(filePath);
		await tar.extract({
			file: filePath,
			cwd: tmpPath,
		});
		const installer = new Installer({
			engine: binary,
			path: tmpPath,
		});
		switch (os) {
			case 'mac64':
			case 'linux64': {
				installer.installBinary({ 'hermes': binary });
				installer.installBinary({ 'hermesc': `${binary}-compiler` });
				break;
			}
			case 'win64': {
				installer.installBinary(
					{ 'hermes.exe': `${binary}.exe` },
					{ symlink: false }
				);
				installer.installBinary(
					{ 'hermesc.exe': `${binary}-compiler.exe` },
					{ symlink: false }
				);
				installer.installLibraryGlob('*.dll');
				installer.installScript({
					name: `${binary}.cmd`,
					symlink: false,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\${binary}.exe" %*
						`;
					}
				});
				installer.installScript({
					name: `${binary}-compiler.cmd`,
					symlink: false,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\${binary}-compiler.exe" %*
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
