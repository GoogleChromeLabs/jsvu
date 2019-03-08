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

const log = require('../shared/log.js');
const download = require('../shared/download.js');

const installSpecificEngineVersion = async ({ name, id, alias, os, version }) => {

	const getSpecificVersion = require(`../engines/${id}/get-specific-version.js`);
	const predictUrl = require(`../engines/${id}/predict-url.js`);
	const extract = require(`../engines/${id}/extract.js`);
	const test = require(`../engines/${id}/test.js`);

	try {

		log.start(`Finding ${name} v${version}…`);
		version = await getSpecificVersion(version);
		log.updateSuccess(`Found specific ${name} version: v${version}.`);

		log.start(`Predicting URL…`);
		const url = predictUrl(version, os);
		log.updateSuccess(`URL: ${url}`);

		log.start('Downloading…');
		const filePath = await download(url);
		log.updateSuccess(`Download completed.`);

		log.start('Extracting…');
		const binary = `${id}-${version}`;
		alias = `${alias}-${version}`;
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

		log.success(`${name} v${version} has been installed! 🎉`);

	} catch (error) {
		log.failure(error);
	}

};

module.exports = installSpecificEngineVersion;
