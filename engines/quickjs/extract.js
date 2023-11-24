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

const extract = ({ filePath, binary, os }) => {
	return new Promise(async (resolve, reject) => {
		const tmpPath = path.dirname(filePath);
        const bin = path.basename(filePath);
		const installer = new Installer({
			engine: binary,
			path: tmpPath,
		});
		switch (os) {
			case 'win32':
			case 'win64': {
				installer.installBinary(
					{ [`${bin}`]: 'qjs.exe' },
					{ symlink: false }
				);
				installer.installScript({
					name: `${binary}.cmd`,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\qjs.exe" %*
						`;
					}
				});
				break;
			}
			case 'mac64':
            case 'mac64arm':
			case 'linux32':
			case 'linux64': {
				installer.installBinary({ [`${bin}`]: 'qjs' });
				installer.installScript({
					name: binary,
					generateScript: (targetPath) => {
						return `
							#!/usr/bin/env bash
							"${targetPath}/qjs" "$@"
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
