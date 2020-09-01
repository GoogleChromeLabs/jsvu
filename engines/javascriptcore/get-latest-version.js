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

const matchResponse = require('../../shared/match-response.js');

const getLatestVersion = (os) => {
	switch (os) {
		case 'linux64': {
			return matchResponse({
				// https://github.com/GoogleChromeLabs/jsvu/issues/98
				url: `https://webkitgtk.org/jsc-built-products/x86_64/release/LAST-IS`,
				regex: /(\d+)\.zip/,
			});
		}
		case 'win32': {
			return matchResponse({
				url: 'https://build.webkit.org/builders/Apple%20Win%20Release%20%28Build%29?numbuilds=25',
				regex: /<td><span[^>]+><a href="[^"]+">(\d+)<\/a><\/span><\/td>\s*<td class="success">success<\/td>/,
			});
		}
		case 'win64': {
			return matchResponse({
				url: 'https://build.webkit.org/builders/WinCairo%2064-bit%20WKL%20Release%20%28Build%29?numbuilds=25',
				regex: /<td><span[^>]+><a href="[^"]+">(\d+)<\/a><\/span><\/td>\s*<td class="success">success<\/td>/,
			});
		}
		case 'mac64': {
			return matchResponse({
				url: 'https://build.webkit.org/builders/Apple%20Mojave%20Release%20%28Build%29?numbuilds=25',
				regex: /<td><span[^>]+><a href="[^"]+">(\d+)<\/a><\/span><\/td>\s*<td class="success">success<\/td>/,
			});
		}
		default: {
			throw new Error(
				`JavaScriptCore does not offer precompiled ${os} binaries.`
			);
		}
	}
};

module.exports = getLatestVersion;
