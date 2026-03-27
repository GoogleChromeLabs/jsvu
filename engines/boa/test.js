'use strict';

const fs = require('fs');
const execa = require('execa');
const tempy = require('tempy');

const config = require('../../shared/config.js');
const jsvuBinPath = config.binPath;

const test = async ({ binary }) => {
	const path = tempy.file();
	const program = `print('Hi!');\n`;
	fs.writeFileSync(path, program);
	console.assert(
		(await execa(`${jsvuBinPath}/${binary}`, [path])).stdout === 'Hi!'
	);
	console.assert(
		(await execa(`${jsvuBinPath}/${binary}`, ['-e', program])).stdout === 'Hi!'
	);
};

module.exports = test;
