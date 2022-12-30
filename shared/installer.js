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

const fse = require('fs-extra');
const path = require('path');

const glob = require('glob');
const tildify = require('tildify');

const config = require('../shared/config.js');
const jsvuPath = config.path;
const jsvuBinPath = config.binPath;

const installSingleBinary = (from, to) => {
	console.log(`Installing binary to ${tildify(to)}…`);
	// TODO: Figure out why `removeSync` appears to be needed here despite the
	// use of `overwrite: true` in `moveSync`.
	fse.removeSync(to);
	fse.moveSync(from, to, {
		overwrite: true,
	});
	fse.chmodSync(to, 0o555);
};

const installSingleBinarySymlink = (from, to) => {
	console.log(`Installing symlink at ${tildify(from)} pointing to ${
		tildify(to)}…`);
	fse.ensureSymlinkSync(to, from);
};

class Installer {
	constructor({ engine, path }) {
		this.engine = engine;
		this.sourcePath = path;
		this.targetRelPath = `engines/${engine}`;
		this.targetPath = `${jsvuPath}/${this.targetRelPath}`;
		fse.ensureDirSync(this.targetPath);
	}
	installLibrary(fileName) {
		const from = `${this.sourcePath}/${fileName}`;
		// Workaround for https://github.com/GoogleChromeLabs/jsvu/issues/81.
		if (!fse.existsSync(from) || fse.statSync(from).size === 1) {
			return false;
		}
		const to = `${this.targetPath}/${fileName}`;
		console.log(`Installing library to ${tildify(to)}…`);
		fse.ensureDirSync(path.dirname(to));
		fse.moveSync(from, to, {
			overwrite: true,
		});
		return true;
	}
	installLibraryGlob(pattern) {
		const filePaths = glob.sync(`${this.sourcePath}/${pattern}`);
		for (const filePath of filePaths) {
			const fileName = path.relative(this.sourcePath, filePath);
			this.installLibrary(fileName);
		}
	}
	installBinary(arg, options = { symlink: true }) {
		if (typeof arg === 'object') {
			for (const from of Object.keys(arg)) {
				const to = arg[from];
				installSingleBinary(
					`${this.sourcePath}/${from}`,
					`${this.targetPath}/${to}`
				);
				if (options.symlink) {
					installSingleBinarySymlink(
						`${jsvuBinPath}/${to}`,
						`${this.targetPath}/${to}`
					);
				}
			}
		} else {
			const from = arg;
			installSingleBinary(
				`${this.sourcePath}/${from}`,
				`${this.targetPath}/${from}`
			);
			if (options.symlink) {
				installSingleBinarySymlink(
					`${jsvuBinPath}/${from}`,
					`${this.targetPath}/${from}`
				);
			}
		}
	}
	installBinarySymlink(arg) {
		if (typeof arg === 'object') {
			for (const to of Object.keys(arg)) {
				const from = arg[to];
				installSingleBinarySymlink(
					`${jsvuBinPath}/${from}`,
					`${this.targetPath}/${to}`
				);
			}
		} else {
			const to = arg;
			installSingleBinarySymlink(
				`${jsvuBinPath}/${to}`,
				`${this.targetPath}/${to}`
			);
		}
	}
	installLicense(arg) {
		for (const from of Object.keys(arg)) {
			const to = `${this.targetPath}/${arg[from]}`;
			console.log(`Installing license to ${tildify(to)}…`);
			fse.moveSync(
				`${this.sourcePath}/${from}`,
				to,
				{
					overwrite: true,
				}
			);
		}
	}
	installScript({ name, alias, symlink, generateScript }) {
		const to = `${jsvuBinPath}/${name}`;
		console.log(`Installing wrapper script to ${tildify(to)}…`);
		const wrapperPath = process.platform === 'win32' ?
			`%~dp0\\..\\${this.targetRelPath}` :
			this.targetPath;
		const contents = generateScript(wrapperPath)
			.trimStart()
			.replaceAll('\t', '');
		fse.removeSync(to);
		fse.writeFileSync(to, contents);
		fse.chmodSync(to, 0o555);
		if (alias) {
			if (symlink) {
				installSingleBinarySymlink(`${jsvuBinPath}/${alias}`, to);
			} else {
				fse.copySync(to, `${jsvuBinPath}/${alias}`);
			}
		}
	}
}

module.exports = {
	Installer,
};
