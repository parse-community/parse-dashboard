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
