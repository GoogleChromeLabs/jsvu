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
		case 'mac64': {
			return 'mac64';
		}
		case 'mac64arm': {
			return 'mac-arm64';
		}
		case 'linux32': {
			return 'linux32';
		}
		case 'linux64': {
			return 'linux64';
		}
		case 'win32': {
			return 'win32';
		}
		case 'win64': {
			return 'win64';
		}
		default: {
			throw new Error(
				`V8 does not offer precompiled ${os} binaries.`
			);
		}
	}
};

module.exports = predictFileName;
