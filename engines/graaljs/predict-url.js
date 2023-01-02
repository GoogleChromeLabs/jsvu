// Copyright 2020 Google Inc.
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
		case 'mac64arm': {
			return 'macos-aarch64'
		}
		case 'mac64': {
			return 'macos-amd64';
		}
		case 'linux64': {
			return 'linux-amd64';
		}
		case 'linux64arm': {
			return 'linux-aarch64';
		}
		case 'win64': {
			return 'windows-amd64';
		}
		default: {
			throw new Error(
				`GraalJS does not offer precompiled ${os} binaries.`
			);
		}
	}
};

const predictUrl = (version, os) => {
	const fileName = predictFileName(os);
	const ext = os.startsWith('win') ? 'zip' : 'tar.gz';
	const url = `https://github.com/oracle/graaljs/releases/download/vm-${version}/graaljs-${version}-${fileName}.${ext}`;
	return url;
};

module.exports = predictUrl;
