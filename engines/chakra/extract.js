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
		switch (os) {
			case 'mac64':
			case 'linux32':
			case 'linux64': {
				const installer = new Installer({
					engine: binary,
					path: `${tmpPath}/ChakraCoreFiles`,
				});
				installer.installLibraryGlob('lib/*');
				installer.installBinary({ 'bin/ch': binary });
				installer.installBinarySymlink({ [binary]: alias });
				installer.installLicense({ 'LICENSE': `LICENSE-${binary}` });
				break;
			}
			case 'win32':
			case 'win64': {
				const installer = new Installer({
					engine: binary,
					path: `${tmpPath}/${os === 'win32' ?
						'x86_release' : 'x64_release'}`,
				});
				installer.installLibraryGlob('*.pdb');
				installer.installLibraryGlob('*.dll');
				installer.installBinary(
					{ 'ch.exe': `${binary}.exe` },
					{ symlink: false }
				);
				installer.installScript({
					name: `${binary}.cmd`,
					alias: `${alias}.cmd`,
					symlink: false,
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
