// Copyright 2017 Google Inc.
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

const crypto = require('crypto');
const fs = require('fs');

const tempy = require('tempy');

const get = require('./get.js');

const hash = (data) => {
	const hasher = crypto.createHash('sha256');
	hasher.update(data);
	return hasher.digest('hex');
};

const download = ({ url, checksum }) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await get(url, {
				// Download as binary file.
				encoding: null,
			});
			const buffer = response.body;
			if (checksum !== undefined) {
				const actualChecksum = hash(buffer);
				if (actualChecksum !== checksum) {
					reject(`Invalid checksum. Expected: ${
						checksum} Actual: ${actualChecksum}`);
				}
			}
			// Passing in `name` ensures that `tempy` creates a temporary directory
			// in which the file is created. Thus, we can later extract the archive
			// within this same directory and use wildcards to move its contents,
			// knowing that there are no other files in the directory.
			const filePath = tempy.file({
				name: checksum !== undefined ? checksum.slice(0, 8) : 'jsvutmpf'
			});
			fs.writeFileSync(filePath, buffer);
			resolve(filePath);
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = download;
