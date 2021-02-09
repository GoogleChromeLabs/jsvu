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
const matchResponse = require('../../shared/match-response.js');

const getBuildId = async (builderId) => {
	const url = `https://build.webkit.org/api/v2/builders/${builderId
	}/builds?order=-number&limit=1&state_string=build%20successful&complete=true`;
	const response = await get(url, {
		json: true,
	});
	const data = response.body;
	const buildId = data.builds[0].buildid;
	return buildId;
};

const getRevision = async (buildId) => {
	const url = `https://build.webkit.org/api/v2/buildsets/${buildId}`;
	const response = await get(url, {
		json: true,
	});
	const data = response.body;
	const revision = data.buildsets[0].sourcestamps[0].revision;
	return revision;
};

const getLatestRevisionFromBuilder = async (builderId) => {
	const buildId = await getBuildId(builderId);
	const revision = await getRevision(buildId);
	return revision;
};

const getLatestVersion = (os) => {
	switch (os) {
		case 'linux64': {
			return matchResponse({
				// https://github.com/GoogleChromeLabs/jsvu/issues/98
				url: `https://webkitgtk.org/jsc-built-products/x86_64/release/LAST-IS`,
				regex: /(\d+)\.zip/,
			});
		}
		case 'win64': {
			// Builder name: WinCairo-64-bit-WKL-Release-Build
			// https://build.webkit.org/#/builders/27
			return getLatestRevisionFromBuilder(27);
		}
		case 'mac64': {
			// Builder name: Apple-Catalina-Release-Build
			// https://build.webkit.org/#/builders/54
			return getLatestRevisionFromBuilder(54);
		}
		case 'mac64arm': {
			// Builder name: Apple-BigSur-Release-Build
			// https://build.webkit.org/#/builders/29
			return getLatestRevisionFromBuilder(29);
		}
		default: {
			throw new Error(
				`JavaScriptCore does not offer precompiled ${os} binaries.`
			);
		}
	}
};

module.exports = getLatestVersion;
