'use strict';

const get = require('../../shared/get.js');

const getLatestVersion = async (os) => {
	const url = 'https://api.github.com/repos/boa-dev/boa/releases/latest';
	const response = await get(url, {
		json: true,
	});
	const data = response.body;
	const version = data.tag_name.replace(/^v/, ''); // Strip prefix.
	return version;
};

module.exports = getLatestVersion;
