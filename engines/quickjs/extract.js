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

const unzip = require('../../shared/unzip.js');
const { Installer } = require('../../shared/installer.js');

const log = require('../../shared/log.js');

const extract = ({ filePath, binary, os }) => {
	return new Promise(async (resolve, reject) => {
		const tmpPath = path.dirname(filePath);
		await unzip({
			from: filePath,
			to: tmpPath,
		});
		const installer = new Installer({
			engine: binary,
			path: tmpPath,
		});
		switch (os) {
			case 'win32':
			case 'win64': {
				installer.installBinary(
					{ 'qjs.exe': `${binary}.exe` },
					{ symlink: false }
				);
				installer.installLibrary('libwinpthread-1.dll');
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
			case 'linux32':
			case 'linux64': {
				installer.installBinary({ 'qjs': binary });
				installer.installScript({
					name: binary,
					generateScript: (targetPath) => {
						return `
							#!/usr/bin/env bash
							"${targetPath}/${binary}" "$@"
						`;
					}
				});
				break;
			}
			case 'mac64':
			case 'mac64arm': {
				const message = `macos of ${os} is not support currently!`;
				log.failure(message);
				return reject(message);
			}
			default: {
				const message = `${os} is not support now, possible os is one of win32, win64, linux32, linux64, mac64, mac64arm!`;
				log.failure(message);
				return reject(message);
			}
		}
		resolve();
	});
};

module.exports = extract;
