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

const { getStatus, setStatus } = require('../shared/status.js');

const log = require('../shared/log.js');
const download = require('../shared/download.js');

const updateEngine = async ({ name, id, verifyChecksum }) => {

	const getLatestVersion = require(`../engines/${id}/get-latest-version.js`);
	const predictUrl = require(`../engines/${id}/predict-url.js`);
	const extract = require(`../engines/${id}/extract.js`);
	const test = require(`../engines/${id}/test.js`);

	try {

		const status = getStatus();
		console.assert(status.os, '`status.os` is defined');

		log.start(`Finding the latest ${name} version…`);
		const version = await getLatestVersion(status.os);
		log.updateSuccess(`Found latest ${name} version: v${version}.`);

		if (status[id] === version) {
			log.failure(`${name} v${version} is already installed.`);
			return;
		}

		log.start(`Predicting URL…`);
		const url = predictUrl(version, status.os);
		log.updateSuccess(`URL: ${url}`);

		let filePath;
		if (verifyChecksum) {
			const getChecksum = require(`../engines/${id}/get-checksums.js`);
			log.start('Getting SHA-256 checksum…');
			const checksum = await getChecksum({ version, url });
			log.updateSuccess(`SHA-256 checksum: ${checksum}`);

			log.start('Downloading and verifying checksum…');
			filePath = await download({ url, checksum });
			log.updateSuccess(`Download and checksum verification completed.`);
		} else {
			log.start('Downloading…');
			filePath = await download({ url });
			log.updateSuccess(`Download completed.`);
		}

		log.start('Extracting…');
		await extract({
			filePath: filePath,
			engine: id,
			os: status.os,
		}); // Note: this adds output to the log.
		log.success(`Extraction completed.`);

		log.start('Testing…');
		await test();
		log.updateSuccess('Testing completed.');

		log.success(`${name} v${version} has been installed! 🎉`);

		// Write version data to the status file, so we can later avoid
		// reinstalling the same version.
		status[id] = version;
		setStatus(status);

	} catch (error) {
		log.failure(error);
	}

};

module.exports = updateEngine;
