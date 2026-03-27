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
					{ [`${bin}`]: 'boa.exe' },
					{ symlink: false }
				);
				installer.installScript({
					name: `${binary}.cmd`,
					generateScript: (targetPath) => {
						return `
							@echo off
							"${targetPath}\\boa.exe" %*
						`;
					}
				});
				break;
			}
			case 'mac64':
			case 'mac64arm':
			case 'linux32':
			case 'linux64': {
				installer.installBinary({ [`${bin}`]: 'boa' });
				installer.installScript({
					name: binary,
					generateScript: (targetPath) => {
						return `
							#!/usr/bin/env bash
							"${targetPath}/boa" "$@"
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
