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
		case 'mac64':
		case 'mac64arm': {
			return 'darwin';
		}
		case 'linux64': {
			return 'linux';
		}
		case 'win64': {
			return 'windows';
		}
		default: {
			throw new Error(
				`Hermes does not offer precompiled ${os} binaries.`
			);
		}
	}
};

const predictUrl = (version, os) => {
	const fileName = predictFileName(os);
	const majorVersion = parseInt(version.split('.')[0]);
	const minorVersion = parseInt(version.split('.')[1]);
	const suffix = majorVersion > 0 || minorVersion >= 13 ? '' : `-v${version}`;
	const url = `https://github.com/facebook/hermes/releases/download/v${version}/hermes-cli-${fileName}${suffix}.tar.gz`;
	return url;
};

module.exports = predictUrl;
