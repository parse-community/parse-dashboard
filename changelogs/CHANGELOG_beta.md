## [4.1.3-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.2...4.1.3-beta.1) (2022-06-18)


### Bug Fixes

* security upgrade semver-regex from 3.1.3 to 3.1.4 ([#2154](https://github.com/ParsePlatform/parse-dashboard/issues/2154)) ([4f9090a](https://github.com/ParsePlatform/parse-dashboard/commit/4f9090ad22460913f7987964ee54f26d348ca254))

## [4.1.2-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.1...4.1.2-beta.1) (2022-06-01)


### Bug Fixes

* config options like `--port` or `--config` are ignored ([#2113](https://github.com/ParsePlatform/parse-dashboard/issues/2113)) ([6d70d8a](https://github.com/ParsePlatform/parse-dashboard/commit/6d70d8aa74caf0d9c0d335a99a48347dc412ac4e))
* data export is missing rows when exporting more than 100 rows ([#2087](https://github.com/ParsePlatform/parse-dashboard/issues/2087)) ([88f1eab](https://github.com/ParsePlatform/parse-dashboard/commit/88f1eab418ff5ef7af24f9ef6583ccaedef2788e))
* preserve previous condition field value on constraint change ([#1969](https://github.com/ParsePlatform/parse-dashboard/issues/1969)) ([f4c3060](https://github.com/ParsePlatform/parse-dashboard/commit/f4c30605f675bd7a681be127b2dfb3fc11f90e32))
* security upgrade async from 2.6.3 to 2.6.4 ([#2094](https://github.com/ParsePlatform/parse-dashboard/issues/2094)) ([283745c](https://github.com/ParsePlatform/parse-dashboard/commit/283745c7c1ebe1bc6f35670f1b6f3b644b94043e))
* security upgrade cross-fetch from 3.1.4 to 3.1.5 ([#2105](https://github.com/ParsePlatform/parse-dashboard/issues/2105)) ([8d42622](https://github.com/ParsePlatform/parse-dashboard/commit/8d426226e6431793e275b68d680776443675ee35))
* security upgrade node-fetch from 2.6.5 to 2.6.7 ([#2114](https://github.com/ParsePlatform/parse-dashboard/issues/2114)) ([5423b0d](https://github.com/ParsePlatform/parse-dashboard/commit/5423b0d70cb72081933ed7531a55f49d39f3b92c))
* upgrade graphiql from 1.8.4 to 1.8.5 ([#2111](https://github.com/ParsePlatform/parse-dashboard/issues/2111)) ([1a50d30](https://github.com/ParsePlatform/parse-dashboard/commit/1a50d30b6b7d769e04c2c8e82d60142dd2e52b70))

### Reverts

* feat: change string filter description ([#2059](https://github.com/ParsePlatform/parse-dashboard/issues/2059)) ([db5d23b](https://github.com/ParsePlatform/parse-dashboard/commit/db5d23bf17f65d0db3e5d0d4ef4ca506d8394fb9))

## [4.1.1-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.0...4.1.1-beta.1) (2022-04-03)


### Bug Fixes

* security upgrade js-beautify from 1.14.0 to 1.14.1 ([#2077](https://github.com/ParsePlatform/parse-dashboard/issues/2077)) ([e4ea787](https://github.com/ParsePlatform/parse-dashboard/commit/e4ea7879d88173b02d66b1339ba98805255ba82c))
* security vulnerability bump minimist from 1.2.5 to 1.2.6 ([#2070](https://github.com/ParsePlatform/parse-dashboard/issues/2070)) ([3d0407e](https://github.com/ParsePlatform/parse-dashboard/commit/3d0407ebd75051bbbe6f0a2aba87b26475e901b9))

# [4.1.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.1...4.1.0-beta.1) (2022-03-23)


### Bug Fixes

* adding internal class (e.g. `_User`) fails due to prefixed underscore ([#2036](https://github.com/ParsePlatform/parse-dashboard/issues/2036)) ([e004e70](https://github.com/ParsePlatform/parse-dashboard/commit/e004e701737718f010978b0830d64bf8e1d8c559))
* security upgrade prismjs from 1.26.0 to 1.27.0 ([#2047](https://github.com/ParsePlatform/parse-dashboard/issues/2047)) ([ffbca12](https://github.com/ParsePlatform/parse-dashboard/commit/ffbca12c80bf32052a1a2b5d315c8a3393d82248))
* upgrade @babel/runtime from 7.17.0 to 7.17.2 ([#2055](https://github.com/ParsePlatform/parse-dashboard/issues/2055)) ([3e8449b](https://github.com/ParsePlatform/parse-dashboard/commit/3e8449b1679f803e9d26876ccfd28f88fea814ff))
* upgrade express from 4.17.2 to 4.17.3 ([#2058](https://github.com/ParsePlatform/parse-dashboard/issues/2058)) ([d1357de](https://github.com/ParsePlatform/parse-dashboard/commit/d1357de1281244f040499a2ca54db0faee4d882c))
* upgrade otpauth from 7.0.10 to 7.0.11 ([#2061](https://github.com/ParsePlatform/parse-dashboard/issues/2061)) ([05c5ac8](https://github.com/ParsePlatform/parse-dashboard/commit/05c5ac87a6cf1675889e58330276dac185929a01))

### Features

* change string filter description ([#2059](https://github.com/ParsePlatform/parse-dashboard/issues/2059)) ([6470c8e](https://github.com/ParsePlatform/parse-dashboard/commit/6470c8e3221e3b4ec95ecd831726a914d24ff619))

# [4.0.0-beta.4](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-beta.3...4.0.0-beta.4) (2022-03-04)


### Bug Fixes

* adding internal class (e.g. `_User`) fails due to prefixed underscore ([#2036](https://github.com/ParsePlatform/parse-dashboard/issues/2036)) ([f80bd07](https://github.com/ParsePlatform/parse-dashboard/commit/f80bd07a42b19fc4fa2632e0147fa72812a87c2f))
* security upgrade prismjs from 1.26.0 to 1.27.0 ([#2047](https://github.com/ParsePlatform/parse-dashboard/issues/2047)) ([3afb24e](https://github.com/ParsePlatform/parse-dashboard/commit/3afb24e708a69560732a725574953333431c1ca9))

# [4.0.0-beta.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-beta.2...4.0.0-beta.3) (2022-02-06)


### Bug Fixes

* bump follow-redirects from 1.14.4 to 1.14.7 ([#1997](https://github.com/ParsePlatform/parse-dashboard/issues/1997)) ([4ca2e97](https://github.com/ParsePlatform/parse-dashboard/commit/4ca2e971890c6ee7ee88195a4c75dbb73dc5a0b1))
* bump markdown-it from 12.3.0 to 12.3.2 ([#1996](https://github.com/ParsePlatform/parse-dashboard/issues/1996)) ([245c22e](https://github.com/ParsePlatform/parse-dashboard/commit/245c22ea21f1af6f3e74a269d74460d5c5ea5c03))
* bump marked from 0.8.2 to 4.0.10 ([#2001](https://github.com/ParsePlatform/parse-dashboard/issues/2001)) ([ae4cc90](https://github.com/ParsePlatform/parse-dashboard/commit/ae4cc900bdbdc4425f0f30c07c6ef689c8cebe8c))
* bump nanoid from 3.1.28 to 3.2.0 ([#2008](https://github.com/ParsePlatform/parse-dashboard/issues/2008)) ([6cfe9ca](https://github.com/ParsePlatform/parse-dashboard/commit/6cfe9cae63a49013489e5683b5e16ab3c4399730))
* calendar widget layout partly hides last days of a month ([#1990](https://github.com/ParsePlatform/parse-dashboard/issues/1990)) ([5bd86dd](https://github.com/ParsePlatform/parse-dashboard/commit/5bd86dd0a5c7857705089cb8a57c078d62863dfc))
* cannot save nullish values for required fields ([#2003](https://github.com/ParsePlatform/parse-dashboard/issues/2003)) ([e1a5497](https://github.com/ParsePlatform/parse-dashboard/commit/e1a5497d4a999d18dcf60f93cdba16d36250a7cc))
* crash when checking for new dashboard release without internet connection ([#2015](https://github.com/ParsePlatform/parse-dashboard/issues/2015)) ([8c36e69](https://github.com/ParsePlatform/parse-dashboard/commit/8c36e693c08a960c4002d7d29bde7d111eff2cd4))
* preserve column sorting preferences in data browser ([#2016](https://github.com/ParsePlatform/parse-dashboard/issues/2016)) ([c2e6557](https://github.com/ParsePlatform/parse-dashboard/commit/c2e65573ccfa29b6d6e727e93b9552380c520f86))
* upgrade parse from 3.4.0 to 3.4.1 ([#2011](https://github.com/ParsePlatform/parse-dashboard/issues/2011)) ([68cf9e2](https://github.com/ParsePlatform/parse-dashboard/commit/68cf9e238594df29c22a687b2976d56894897f34))
* various UI bugs (e.g. filter data browser, switch app, upload file) ([#2010](https://github.com/ParsePlatform/parse-dashboard/issues/2010)) ([a508a58](https://github.com/ParsePlatform/parse-dashboard/commit/a508a58ce927fd7e08d249818c38f6fb1305956c))

# [4.0.0-beta.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-beta.1...4.0.0-beta.2) (2022-01-23)


### Bug Fixes

* various UI bugs (e.g. filter data browser, switch app, upload file) ([#2014](https://github.com/ParsePlatform/parse-dashboard/issues/2014)) ([785978e](https://github.com/ParsePlatform/parse-dashboard/commit/785978ecce501cf23cb7fc3d82fa3f7c7dce7f6a))

# [4.0.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-beta.3...4.0.0-beta.1) (2022-01-01)


### Bug Fixes

* bump graphiql from 1.4.6 to 1.4.7 ([#1920](https://github.com/ParsePlatform/parse-dashboard/issues/1920)) ([26c0dfa](https://github.com/ParsePlatform/parse-dashboard/commit/26c0dfa7eaa68194d53beaeed1ca6705f3d11a6a))
* context menu in data browser not opening for cell of type number ([#1913](https://github.com/ParsePlatform/parse-dashboard/issues/1913)) ([fb0e3a9](https://github.com/ParsePlatform/parse-dashboard/commit/fb0e3a9882438069fef1d7926ec74bad6bb3eebc))
* opening filter menu in data browser leads to blank page ([#1958](https://github.com/ParsePlatform/parse-dashboard/issues/1958)) ([750e8b1](https://github.com/ParsePlatform/parse-dashboard/commit/750e8b1f018e37360e6577f423da005d7f773f20))
* saving relation column fails if class has required fields ([#1937](https://github.com/ParsePlatform/parse-dashboard/issues/1937)) ([c67db08](https://github.com/ParsePlatform/parse-dashboard/commit/c67db083a9657be2d16ba566a7f6ce497fd66092))
* security upgrade qrcode from 1.4.4 to 1.5.0 ([#1930](https://github.com/ParsePlatform/parse-dashboard/issues/1930)) ([244e1bb](https://github.com/ParsePlatform/parse-dashboard/commit/244e1bba1a3fb89b9ed8c93a3d0f7163eacd2691))

### Features

* upgrade graphiql from 1.4.7 to 1.5.1 ([#1943](https://github.com/ParsePlatform/parse-dashboard/issues/1943)) ([ebb1f66](https://github.com/ParsePlatform/parse-dashboard/commit/ebb1f660f1d10921f92d05eb58b09d548e00d3a9))
* upgrade graphql from 15.7.0 to 16.0.0 ([#1926](https://github.com/ParsePlatform/parse-dashboard/issues/1926)) ([7c94e51](https://github.com/ParsePlatform/parse-dashboard/commit/7c94e512ed5428797823d24ac205ece59e94f3ea))
* upgrade parse from 3.3.1 to 3.4.0 ([#1942](https://github.com/ParsePlatform/parse-dashboard/issues/1942)) ([13a250e](https://github.com/ParsePlatform/parse-dashboard/commit/13a250e2e04ba0f12be0c2da8c9075ea8eb4d83f))


### BREAKING CHANGES

* The minimum required Node.js version is 12.22.0. ([7c94e51](7c94e51))
* The required Node version was increased to >=12.20.0. ([ebb1f66](ebb1f66))

# [3.3.0-beta.3](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-beta.2...3.3.0-beta.3) (2021-11-09)


### Bug Fixes

* bump graphiql from 1.4.6 to 1.4.7 ([#1920](https://github.com/ParsePlatform/parse-dashboard/issues/1920)) ([35fd021](https://github.com/ParsePlatform/parse-dashboard/commit/35fd021cb7d7cc05dd6a532948caa25b51fd8340))

# [3.3.0-beta.2](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-beta.1...3.3.0-beta.2) (2021-11-02)


### Bug Fixes

* context menu in data browser not opening for cell of type number ([#1913](https://github.com/ParsePlatform/parse-dashboard/issues/1913)) ([8731c35](https://github.com/ParsePlatform/parse-dashboard/commit/8731c350bd1867cedbaa735f035d16dde4033bc7))

# [3.3.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.2.1-beta.1...3.3.0-beta.1) (2021-11-01)


### Bug Fixes

* always pass boolean value when toggling checkbox ([#1872](https://github.com/ParsePlatform/parse-dashboard/issues/1872)) ([2e9fd59](https://github.com/ParsePlatform/parse-dashboard/commit/2e9fd59c2ce33f60c904213dc0b5956c4fbfe0c9))
* app icons are cropped in the app list for small screen sizes ([#1876](https://github.com/ParsePlatform/parse-dashboard/issues/1876)) ([9fc56a6](https://github.com/ParsePlatform/parse-dashboard/commit/9fc56a6be210d82c4f1b03e804bd492d0848a62d))
* link icon in pointer cell not visible when cell is too narrow ([#1856](https://github.com/ParsePlatform/parse-dashboard/issues/1856)) ([69b897d](https://github.com/ParsePlatform/parse-dashboard/commit/69b897d17f379f9e5af1a0f64c557f54054ebe67))
* manual column preferences are overwritten by columnPreference option on page refresh ([#1881](https://github.com/ParsePlatform/parse-dashboard/issues/1881)) ([7232b0b](https://github.com/ParsePlatform/parse-dashboard/commit/7232b0b13916ee9bc409279242b5d4bbc4fee033))
* notification to upgrade dashboard for latest features not working ([#1894](https://github.com/ParsePlatform/parse-dashboard/issues/1894)) ([81361b6](https://github.com/ParsePlatform/parse-dashboard/commit/81361b67946a347d31ef96d61e3dd11503a6ad5b))
* upgrade graphql from 15.4.0 to 15.6.0 ([#1853](https://github.com/ParsePlatform/parse-dashboard/issues/1853)) ([fca9b14](https://github.com/ParsePlatform/parse-dashboard/commit/fca9b14cbe23ea0537bebb48bc390484932257c7))
* upgrade graphql from 15.6.0 to 15.6.1 ([#1887](https://github.com/ParsePlatform/parse-dashboard/issues/1887)) ([0cfe59e](https://github.com/ParsePlatform/parse-dashboard/commit/0cfe59e475d9f991a3579eb81e8e8a24705eec6a))
* upgrade inquirer from 8.1.3 to 8.2.0 ([#1886](https://github.com/ParsePlatform/parse-dashboard/issues/1886)) ([c77f335](https://github.com/ParsePlatform/parse-dashboard/commit/c77f335f6203842d0c83bc161ced0376ae166f26))
* upgrade passport from 0.4.1 to 0.5.0 ([#1865](https://github.com/ParsePlatform/parse-dashboard/issues/1865)) ([8d845f0](https://github.com/ParsePlatform/parse-dashboard/commit/8d845f0b59d161d21b6b28691b9962869fac2f20))
* upload of file as default value fails when adding a new column ([#1875](https://github.com/ParsePlatform/parse-dashboard/issues/1875)) ([6040dd0](https://github.com/ParsePlatform/parse-dashboard/commit/6040dd0dfe3315131dfeccc42f54cdf4d6d6b90e))

### Features

* add config option `columnPreference.filterSortToTop` to set column name order in filter dialog ([#1884](https://github.com/ParsePlatform/parse-dashboard/issues/1884)) ([3acbda1](https://github.com/ParsePlatform/parse-dashboard/commit/3acbda1cf2adfaa4471ef761c81e000eb1d04a97))
* add pointer representation by a chosen column instead of objectId ([#1852](https://github.com/ParsePlatform/parse-dashboard/issues/1852)) ([d747786](https://github.com/ParsePlatform/parse-dashboard/commit/d7477860ebf972a1cb69a43761e77841831754e2))
* add visual distinction in data browser for internal classes and display their real names with underscore ([#1878](https://github.com/ParsePlatform/parse-dashboard/issues/1878)) ([ac8d85e](https://github.com/ParsePlatform/parse-dashboard/commit/ac8d85e368d1ff0f2bc644b30264b9af7c86c76d))
* allow GraphIQL headers ([#1836](https://github.com/ParsePlatform/parse-dashboard/issues/1836)) ([3afcf73](https://github.com/ParsePlatform/parse-dashboard/commit/3afcf730c1303b3957ab03d683ada86242175579))
* allow graphQL headers ([34536b3](https://github.com/ParsePlatform/parse-dashboard/commit/34536b3ba200728e38ff017e487b0339bf0bee6b))

### Reverts

* Revert "Update CloudCode.react.js" ([eea1e2d](https://github.com/ParsePlatform/parse-dashboard/commit/eea1e2dad28795e55467091dc2f7d99790bdd3c4))

## [3.2.1-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.2.0...3.2.1-beta.1) (2021-10-08)


### Bug Fixes

* enabling context menu for read-only cells ([#1844](https://github.com/ParsePlatform/parse-dashboard/issues/1844)) ([a38a885](https://github.com/ParsePlatform/parse-dashboard/commit/a38a885db23e3a76c1e24f880e061dc882e1d37f))
