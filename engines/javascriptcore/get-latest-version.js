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

const matchResponse = require('../../shared/match-response.js');

const getLatestVersion = (os) => {
	switch (os) {
		case 'linux32':
		case 'linux64': {
			return matchResponse({
				url: `https://webkitgtk.org/jsc-built-products/x86_${
					os === 'linux32' ? '32' : '64' }/release/?C=M;O=D`,
				// Check for the most recent *.sha256sum file rather than the
				// most recent *.zip file to avoid the race condition where the
				// ZIP file has not fully been uploaded yet. The *.sha256sum
				// files are written last, so once one is available the
				// corresponding ZIP file is guaranteed to be available.
				// https://mths.be/bww
				regex: /<a href="(\d+)\.sha256sum">/,
			});
		}
		case 'win32':
		case 'win64': {
			return matchResponse({
				url: 'https://build.webkit.org/builders/Apple%20Win%20Release%20%28Build%29?numbuilds=25',
				regex: /<td><span[^>]+><a href="[^"]+">(\d+)<\/a><\/span><\/td>\s*<td class="success">success<\/td>/,
			})
		}
		case 'mac64': {
			return matchResponse({
				url: 'https://build.webkit.org/builders/Apple%20High%20Sierra%20Release%20%28Build%29?numbuilds=25',
				regex: /<td><span[^>]+><a href="[^"]+">(\d+)<\/a><\/span><\/td>\s*<td class="success">success<\/td>/,
			});
		}
	}
};

module.exports = getLatestVersion;
