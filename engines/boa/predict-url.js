'use strict';

const predictFileName = (os) => {
	switch (os) {
		case 'mac64': {
			return 'x86_64-apple-darwin';
		}
		case 'mac64arm': {
			return 'aarch64-apple-darwin';
		}
		case 'linux64': {
			return 'x86_64-unknown-linux-gnu';
		}
		case 'win64': {
			return 'x86_64-pc-windows-msvc.exe';
		}
		default: {
			throw new Error(
				`Boa does not offer precompiled ${os} binaries.`
			);
		}
	}
};

const predictUrl = (version, os) => {
	const fileName = predictFileName(os);
	const url = `https://github.com/boa-dev/boa/releases/download/v${version}/boa-${fileName}`;
	return url;
};

module.exports = predictUrl;
