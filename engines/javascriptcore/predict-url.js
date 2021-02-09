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

const predictUrl = (version, os) => {
	switch (os) {
		case 'mac64': {
			return `https://s3-us-west-2.amazonaws.com/archives.webkit.org/mac-catalina-x86_64-release/${version}.zip`;
		}
		case 'mac64arm': {
			return `https://s3-us-west-2.amazonaws.com/archives.webkit.org/mac-bigsur-x86_64%20arm64-release/${version}.zip`;
		}
		case 'linux64': {
			return `https://webkitgtk.org/jsc-built-products/x86_64/release/${version}.zip`;
		}
		case 'win64': {
			return `https://s3-us-west-2.amazonaws.com/archives.webkit.org/wincairo-x86_64-release/${version}.zip`;
		}
		default: {
			throw new Error(
				`JavaScriptCore does not offer precompiled ${os} binaries.`
			);
		}
	}
};

module.exports = predictUrl;
