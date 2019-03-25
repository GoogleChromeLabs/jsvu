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

const { setStatus } = require('../shared/status.js');
const log = require('../shared/log.js');
const download = require('../shared/download.js');

const installSpecificEngineVersion = async ({ status, name, id, alias }) => {

	const getSpecificVersion = require(`../engines/${id}/get-specific-version.js`);
	const predictUrl = require(`../engines/${id}/predict-url.js`);
	const extract = require(`../engines/${id}/extract.js`);
	const test = require(`../engines/${id}/test.js`);

	try {

		const version = status.version;
		log.start(`Finding ${name} v${version}…`);
		const fullVersion = await getSpecificVersion(version);
		log.updateSuccess(`Found specific ${name} version: v${fullVersion}.`);

		if (
			status.versions &&
			status.versions[id] &&
			status.versions[id][version] === fullVersion
		) {
			log.failure(`${name} v${fullVersion} is already installed.`);
			return;
		}

		log.start(`Predicting URL…`);
		const os = status.os;
		const url = predictUrl(fullVersion, os);
		log.updateSuccess(`URL: ${url}`);

		log.start('Downloading…');
		const filePath = await download(url);
		log.updateSuccess(`Download completed.`);

		log.start('Extracting…');
		const binary = `${id}-${fullVersion}`;
		alias = `${alias}-${fullVersion}`;
		await extract({
			filePath: filePath,
			binary: binary,
			alias: alias,
			os: os,
		}); // Note: this adds output to the log.
		log.success(`Extraction completed.`);

		log.start('Testing…');
		await test({
			binary: binary,
			alias: alias,
		});
		log.updateSuccess('Testing completed.');

		log.success(`${name} v${fullVersion} has been installed! 🎉`);

		// Write version data to the status file, so we can later avoid
		// reinstalling the same version.
		if (status.versions === undefined) {
			status.versions = {
				[id]: {
					[version]: fullVersion,
				},
			};
		} else {
			if (status.versions[id] === undefined) {
				status.versions[id] = {
					[version]: fullVersion,
				};
			} else {
				status.versions[id][version] = fullVersion;
			}
		}
		setStatus(status);

	} catch (error) {
		log.failure(error);
	}

};

module.exports = installSpecificEngineVersion;
