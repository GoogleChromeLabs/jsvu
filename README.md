# jsvu [![Build status](https://travis-ci.org/GoogleChromeLabs/jsvu.svg?branch=master)](https://travis-ci.org/GoogleChromeLabs/jsvu)

_jsvu_ is the <b>J</b>ava<b>S</b>cript (engine) <b>V</b>ersion <b>U</b>pdater.

_jsvu_ makes it easy to install recent versions of various JavaScript engines without having to compile them from source.

[![](screenshot.svg)](https://asciinema.org/a/rfS1M5ynKm1hGaBqJYJj0mGCi)

## Installation

**Note:** _jsvu_ requires Node.js v8.9.0+. (_jsvu_ follows the latest [active LTS](https://github.com/nodejs/Release#release-schedule) version of Node.)

Install the _jsvu_ CLI:

```sh
npm install jsvu -g
```

Modify your dotfiles (e.g. `~/.bashrc`) to add `~/.jsvu` to your `PATH`:

```sh
export PATH="${HOME}/.jsvu:${PATH}"
```

Then, run `jsvu`:

```sh
jsvu
```

On first run, `jsvu` prompts you for your operating system and architecture, and the list of JavaScript engines you wish to manage through `jsvu`. It then downloads and installs the latest version of each of the engines you selected.

To update the installed JavaScript engines later on, just run `jsvu` again.

## Supported engines

| JavaScript engine         | Binary name               | `mac64`             | `win32`         | `win64`              | `linux32` | `linux64` |
| ------------------------- | ------------------------- | ------------------- | --------------- | -------------------- | --------- | --------- |
| [**Chakra**][ch]          | `chakra` or `ch`          | ✅                  | ✅               | ✅                   | ❌        | ✅        |
| [**JavaScriptCore**][jsc] | `javascriptcore` or `jsc` | ✅                  | ✅ <sup>\*</sup> | ✅ <sup>(32)\*</sup> | ✅        | ✅        |
| [**SpiderMonkey**][sm]    | `spidermonkey` or `sm`    | ✅                  | ✅               | ✅                   | ✅        | ✅        |
| [**V8**][v8]              | `v8`                      | ✅                  | ✅               | ✅                   | ✅        | ✅        |
| [**XS**][xs]              | `xs`                      | ✅ <sup>(32)</sup>  | ✅               | ✅ <sup>(32)</sup>   | ✅        | ✅        |

<sup>\*</sup> To get JavaScriptCore running on Windows, [you’ll have to install iTunes](https://lists.webkit.org/pipermail/webkit-dev/2013-August/025242.html).

[ch]: https://github.com/Microsoft/ChakraCore/issues/2278#issuecomment-277301120
[sm]: https://bugzilla.mozilla.org/show_bug.cgi?id=1336514
[jsc]: https://bugs.webkit.org/show_bug.cgi?id=179945
[v8]: https://bugs.chromium.org/p/v8/issues/detail?id=5918
[xs]: https://github.com/Moddable-OpenSource/moddable-xst

## Integration with eshost-cli

[eshost-cli](https://github.com/bterlson/eshost-cli) makes it easy to run and compare code in all JavaScript engines that _jsvu_ installs.

First, install eshost-cli:

```sh
npm install -g eshost-cli
```

Then, tell eshost-cli where _jsvu_ installs each JavaScript engine.

### Linux/Mac

```sh
eshost --add 'Chakra' ch ~/.jsvu/chakra
eshost --add 'JavaScriptCore' jsc ~/.jsvu/javascriptcore
eshost --add 'SpiderMonkey' jsshell ~/.jsvu/spidermonkey
eshost --add 'V8 --harmony' d8 ~/.jsvu/v8 --args '--harmony'
eshost --add 'V8' d8 ~/.jsvu/v8
eshost --add 'XS' xs ~/.jsvu/xs
```

### Windows

```bat
eshost --add "Chakra" ch "%USERPROFILE%\.jsvu\chakra.cmd"
eshost --add "JavaScriptCore" jsc "%USERPROFILE%\.jsvu\javascriptcore.cmd"
eshost --add "SpiderMonkey" jsshell "%USERPROFILE%\.jsvu\spidermonkey.cmd"
eshost --add "V8 --harmony" d8 "%USERPROFILE%\.jsvu\v8.cmd" --args "--harmony"
eshost --add "V8" d8 "%USERPROFILE%\.jsvu\v8.cmd"
eshost --add "XS" xs "%USERPROFILE%\.jsvu\xs.cmd"
```

That’s it! You can now run code snippets in all those engines with a single command:

```sh
eshost -e 'new RegExp("\n").toString()' # https://crbug.com/v8/1982

eshost -e '(function maxCallStackSize() { try { return 1 + maxCallStackSize(); } catch (_) { return 1; }}())'
```

## Integration with non-interactive environments

On your personal devices, the only command you’ll ever need is `jsvu` as described above. There are no command-line flags to remember. 👋🏻

However, there are use cases for running jsvu within non-interactive environments (e.g. as part of continuous integration), where it’s desirable to bypass the initial `jsvu` prompt asking to confirm your operating system, architecture, and the list of JavaScript engines to install. Here’s how to do that:

```sh
jsvu --os=mac64 --engines=all
# Equivalent to:
jsvu --os=mac64 --engines=chakra,javascriptcore,spidermonkey,v8,xs
```

## Security considerations

_jsvu_ avoids the need for `sudo` privileges by installing everything in `~/.jsvu` rather than, say, `/usr/bin`.

_jsvu_ downloads files over HTTPS, and only uses URLs that are controlled by the creators of the JavaScript engine or, in the case of JavaScriptCore on Linux, the port maintainers. As an additional layer of security, _jsvu_ performs SHA-256 checksum verification where applicable.

## Author

[Mathias Bynens](https://mathiasbynens.be/) ([@mathias](https://twitter.com/mathias))
