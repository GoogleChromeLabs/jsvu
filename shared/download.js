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

const fs = require('fs');

const ProgressBar = require('progress');
const tempy = require('tempy');

const get = require('./get.js');

const download = (url) => {
	return new Promise(async (resolve, reject) => {
		try {
			const bar = new ProgressBar('  [:bar] :percent', {
				complete: '=',
				incomplete: ' ',
				width: 72,
				total: 100,
			});
			const response = await get(url, {
				// Download as binary file.
				encoding: null,
			}).on('downloadProgress', (progress) => {
				bar.update(progress.percent);
			}).on('error', (error) => {
				reject(`Download error: ${error}`);
			});
			// Clear the progress bar.
			console.log('\x1B[1A\x1B[2K\x1B[1A');
			const buffer = response.body;
			// Passing in `name` ensures that `tempy` creates a temporary directory
			// in which the file is created. Thus, we can later extract the archive
			// within this same directory and use wildcards to move its contents,
			// knowing that there are no other files in the directory.
			const filePath = tempy.file({
				name: 'jsvutmpf',
			});
			fs.writeFileSync(filePath, buffer);
			resolve(filePath);
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = download;
