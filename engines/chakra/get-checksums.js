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

const get = require('../../shared/get.js');

const getChecksums = (version) => {
	const url = `https://github.com/Microsoft/ChakraCore/releases/tag/v${version}`;
	// https://stackoverflow.com/a/1732454/96656
	const regex = /href="(https:\/\/aka\.ms\/chakracore\/cc_[^"]+)"[^>]*>[^<]+<\/a><\/td>\n<td align="left"><code>([a-f0-9]{64})<\/code><\/td>/g;
	return new Promise(async (resolve, reject) => {
		try {
			const response = await get(url);
			const body = response.body;
			const urlsToChecksums = new Map();
			// TODO: Use `String#matchAll` once it’s natively available.
			let match;
			while (match = regex.exec(body)) {
				const [, fileUrl, checksum] = match;
				urlsToChecksums.set(fileUrl, checksum);
			}
			resolve(urlsToChecksums);
		} catch (error) {
			reject(error);
		}
	});
};

const getChecksum = async ({ version, url }) => {
	const checksums = await getChecksums(version);
	const checksum = checksums.get(url);
	if (checksum) {
		return checksum;
	}
	throw new Error('Checksum not found.');
};

module.exports = getChecksum;
