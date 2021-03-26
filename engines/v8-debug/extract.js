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
		installer.installLibrary('icudtl.dat');
		const hasNativesBlob = installer.installLibrary('natives_blob.bin');
		installer.installLibrary('snapshot_blob.bin');
		switch (os) {
			case 'mac64':
			case 'mac64arm': {
				installer.installLibraryGlob('*.dylib');
				installer.installBinary({ 'd8': binary }, { symlink: false });
				installer.installScript({
					name: binary,
					generateScript: (targetPath) => {
						const nativesBlobArg = hasNativesBlob ? ` --natives_blob="${targetPath}/natives_blob.bin"` : '';
						return `
							#!/usr/bin/env bash
							"${targetPath}/${binary}"${nativesBlobArg} --snapshot_blob="${targetPath}/snapshot_blob.bin" "$@"
						`;
					}
				});
				break;
			}
			case 'linux32':
			case 'linux64': {
				installer.installLibraryGlob('*.so');
				installer.installBinary({ 'd8': binary }, { symlink: false });
				installer.installScript({
					name: binary,
					generateScript: (targetPath) => {
						const nativesBlobArg = hasNativesBlob ? ` --natives_blob="${targetPath}/natives_blob.bin"` : '';
						return `
							#!/usr/bin/env bash
							"${targetPath}/${binary}"${nativesBlobArg} --snapshot_blob="${targetPath}/snapshot_blob.bin" "$@"
						`;
					}
				});
				break;
			}
			case 'win32':
			case 'win64': {
				installer.installLibraryGlob('*.dll');
				installer.installBinary(
					{ 'd8.exe': `${binary}.exe` },
					{ symlink: false }
				);
				installer.installScript({
					name: `${binary}.cmd`,
					generateScript: (targetPath) => {
						const nativesBlobArg = hasNativesBlob ? ` --natives_blob="${targetPath}\\natives_blob.bin"` : '';
						return `
							@echo off
							"${targetPath}\\${binary}.exe"${nativesBlobArg} --snapshot_blob="${targetPath}\\snapshot_blob.bin" %*
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
