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

const predictFileName = (os) => {
	switch (os) {
		case 'win32': {
			return 'win-x86';
		}
		case 'win64': {
			return 'win-x86_64';
		}
		case 'linux32': {
			return 'linux-x86';
		}
		case 'linux64': {
			return 'linux-x86_64';
		}
		case 'mac64':
		case 'mac64arm': {
			return 'darwin';
		}
		default: {
			throw new Error(
				`QuickJS does not offer precompiled ${os} binaries.`
			);
		}
	}
};

const predictUrl = (version, os) => {
	const fileName = predictFileName(os);
	const url = `https://github.com/quickjs-ng/quickjs/releases/download/${version}/qjs-${fileName}`;
	return url;
};

module.exports = predictUrl;
