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

const { Installer } = require('../../shared/installer.js');
const unzip = require('../../shared/unzip.js');

const extract = ({ filePath, binary, alias, os }) => {
	return new Promise(async (resolve, reject) => {
		const tmpPath = path.dirname(filePath);
		await unzip({
			from: filePath,
			to: tmpPath,
		});
		switch (os) {
			case 'mac64':
			case 'mac64arm': {
				const installer = new Installer({
					engine: binary,
					path: `${tmpPath}/Release`,
				});
				installer.installLibraryGlob('JavaScriptCore.framework/*');
				installer.installBinary({ 'jsc': binary }, { symlink: false });
				installer.installScript({
					name: binary,
					alias: alias,
					generateScript: (targetPath) => {
						return `
							#!/usr/bin/env bash
							DYLD_FRAMEWORK_PATH="${targetPath}" DYLD_LIBRARY_PATH="${targetPath}" "${targetPath}/${binary}" "$@"
						`;
					}
				});
				break;
			}
			case 'linux32':
			case 'linux64': {
				const installer = new Installer({
					engine: binary,
					path: tmpPath,
				});
				installer.installLibraryGlob('lib/*');
				installer.installBinary({ 'bin/jsc': binary }, { symlink: false });
				installer.installScript({
					name: binary,
					alias: alias,
					generateScript: (targetPath) => {
						return `
							#!/usr/bin/env bash
							LD_LIBRARY_PATH="${targetPath}/lib" exec "${targetPath}/lib/ld-linux${
								os === 'linux64' ? '-x86-64' : '' }.so.2" "${targetPath}/${binary}" "$@"
						`;
					}
				});
				break;
			}
			case 'win32':
			case 'win64': {
				const installer = new Installer({
					engine: binary,
					path: `${tmpPath}/bin${os === 'win64' ? '64' : '32'}`,
				});
				installer.installLibraryGlob('JavaScriptCore.resources/*');
				installer.installLibraryGlob('*.dll');
				installer.installLibraryGlob('*.pdb');
				// One DLL that gets loaded by `jsc.exe`, `jscLib.dll`, depends on the
				// filename of `jsc.exe`. Because of that, we avoid renaming `jsc.exe`
				// to `javascriptcore.exe` on Windows.
				installer.installBinary('jsc.exe', { symlink: false });
				installer.installScript({
					name: `${binary}.cmd`,
					alias: `${alias}.cmd`,
					symlink: false,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\jsc.exe" %*
						`;
					}
				});
				console.log('NOTE: JavaScriptCore requires external dependencies to run on Windows. Please see README.md for details.');
				break;
			}
		}
		resolve();
	});
};

module.exports = extract;
