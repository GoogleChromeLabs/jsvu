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
const getMacOsName = require('./get-macos-name.js');

const hashToRevision = async (hash) => {
	const revision = await matchResponse({
		url: `https://api.github.com/repos/WebKit/WebKit/commits/${hash}`,
		regex: /Canonical link: https:\/\/commits\.webkit\.org\/(\d+)@main/,
	});
	return revision;
};

const getLatestCommitHashOrRevisionFromBuilder = async (builderId) => {
	const url = `https://build.webkit.org/api/v2/builders/${builderId
	}/builds?order=-number&limit=1&property=got_revision&complete=true`;
	const response = await get(url, {
		json: true,
	});
	const data = response.body;
	const hash = data.builds[0].properties.got_revision[0];
	// Confusingly, `hash` is either a commit hash (seemingly for modern
	// builders) or a revision number (for older builders).
	return hash;
};

const getLatestRevisionFromBuilder = async (builderId) => {
	const hash = await getLatestCommitHashOrRevisionFromBuilder(builderId);
	const revision = await hashToRevision(hash);
	return revision;
};

const getLatestVersion = (os) => {
	switch (os) {
		case 'linux64': {
			return matchResponse({
				// https://github.com/GoogleChromeLabs/jsvu/issues/98
				url: `https://webkitgtk.org/jsc-built-products/x86_64/release/LAST-IS`,
				regex: /(\d+)@main\.zip/,
			});
		}
		case 'win64': {
			// Builder name: WinCairo-64-bit-WKL-Release-Build
			// https://build.webkit.org/#/builders/27
			return getLatestRevisionFromBuilder(27);
		}
		case 'mac64':
		case 'mac64arm': {
			const name = getMacOsName();
			if (name === 'ventura') {
				// Builder name: Apple-Ventura-Release-Build
				// https://build.webkit.org/#/builders/706
				// This publishes universal x86_64 + arm64 binaries.
				return getLatestRevisionFromBuilder(706);
			} else if (name === 'monterey') {
				// Builder name: Apple-Monterey-Release-Build
				// https://build.webkit.org/#/builders/368
				// This publishes universal x86_64 + arm64 binaries.
				return getLatestRevisionFromBuilder(368);
			} else {
				throw new Error(`Unknown MacOS name: ${name}.`);
			}
		}
		default: {
			throw new Error(
				`JavaScriptCore does not offer precompiled ${os} binaries.`
			);
		}
	}
};

module.exports = getLatestVersion;
