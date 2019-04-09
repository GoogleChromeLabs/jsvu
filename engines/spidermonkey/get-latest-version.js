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

const get = require('../../shared/get.js');

const getLatestVersion = () => {
	// Note: It’d be nice to just use
	// https://product-details.mozilla.org/1.0/firefox_versions.json
	// but it doesn’t seem to be as up-to-date. At the time of writing
	// it lists v58.0b4 instead of v58.0b5, whereas the resource below
	// does include v58.0b5. 🤷🏼‍♂️
	const url = 'https://product-details.mozilla.org/1.0/firefox_history_development_releases.json';
	return new Promise(async (resolve, reject) => {
		try {
			const response = await get(url, {
				json: true
			});
			const data = response.body;
			// Don’t rely on the upstream sort order.
			// https://github.com/GoogleChromeLabs/jsvu/issues/65
			let latestVersion = 0;
			let latestTimestamp = 0;
			for (const [key, value] of Object.entries(data)) {
				const timestamp = +new Date(value);
				if (latestTimestamp < timestamp) {
					latestTimestamp = timestamp;
					latestVersion = key;
				}
			}
			const version = latestVersion;
			resolve(version);
		} catch (error) {
			reject(error.response.body);
		}
	});
};

module.exports = getLatestVersion;
