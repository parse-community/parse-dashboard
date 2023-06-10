# [5.2.0-beta.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-beta.1...5.2.0-beta.2) (2023-06-10)


### Bug Fixes

* Back button in data browser disappears after page refresh ([#2421](https://github.com/ParsePlatform/parse-dashboard/issues/2421)) ([6c5f19f](https://github.com/ParsePlatform/parse-dashboard/commit/6c5f19f6ed2cda1f1f0dc59bdaed3ae49f264380))
* Cannot navigate to nested relation field in data browser ([#2420](https://github.com/ParsePlatform/parse-dashboard/issues/2420)) ([e7ace9e](https://github.com/ParsePlatform/parse-dashboard/commit/e7ace9efa068b92c5cf0e5ccdad169ac7d71e81a))
* Dashboard crashes when adding a row with modal in a class that contains a pointer to another class that contains an array of pointers ([#2416](https://github.com/ParsePlatform/parse-dashboard/issues/2416)) ([286269f](https://github.com/ParsePlatform/parse-dashboard/commit/286269f3e2c4e1c83b14003ce72caaf1f39b16c1))
* Empty table in data browser when navigating back using the "back” button ([#2423](https://github.com/ParsePlatform/parse-dashboard/issues/2423)) ([6f3dab6](https://github.com/ParsePlatform/parse-dashboard/commit/6f3dab60c257c76345235acfd3e43aafadeb84c8))
* File uploading status not updating in data browser ([#2422](https://github.com/ParsePlatform/parse-dashboard/issues/2422)) ([e761f97](https://github.com/ParsePlatform/parse-dashboard/commit/e761f9715a8366466c6620994ce698adbbfc48cd))
* Hitting backspace key in data browser crashes dashboard ([#2456](https://github.com/ParsePlatform/parse-dashboard/issues/2456)) ([32aeea2](https://github.com/ParsePlatform/parse-dashboard/commit/32aeea244d81404579f55adf25244c11e3a797d1))
* Incorrect date picker position in data browser filter dialog ([#2425](https://github.com/ParsePlatform/parse-dashboard/issues/2425)) ([b96b48f](https://github.com/ParsePlatform/parse-dashboard/commit/b96b48fdd5ce452783e0887c36231971a1822173))
* Option missing for Parse Config parameter to require master key ([#2440](https://github.com/ParsePlatform/parse-dashboard/issues/2440)) ([6623369](https://github.com/ParsePlatform/parse-dashboard/commit/66233698b333422f306dc7024949aef2ea028f34))
* Scroll position is preserved when re-opening the same class in data browser via navigation bar ([#2445](https://github.com/ParsePlatform/parse-dashboard/issues/2445)) ([667675c](https://github.com/ParsePlatform/parse-dashboard/commit/667675c031b0483be210a88da3b159f5f815d6fb))
* Text input cursor jumps to first position when writing long text ([#2413](https://github.com/ParsePlatform/parse-dashboard/issues/2413)) ([422ffb2](https://github.com/ParsePlatform/parse-dashboard/commit/422ffb2897bb2664eb47b5aaad5094a8b39431bf))

### Features

* Add export of saved data browser filters via `classPreference` settings ([#2455](https://github.com/ParsePlatform/parse-dashboard/issues/2455)) ([f56f946](https://github.com/ParsePlatform/parse-dashboard/commit/f56f946023c628c96030e9d2d66284c53decd33e))
* Add filter views to save frequently used filters in data browser ([#2404](https://github.com/ParsePlatform/parse-dashboard/issues/2404)) ([a9ec3a9](https://github.com/ParsePlatform/parse-dashboard/commit/a9ec3a915ff354304f382c17e8d5311b2c96d7ff))
* Add links to users and roles in ACL dialog and handle invalid entries ([#2436](https://github.com/ParsePlatform/parse-dashboard/issues/2436)) ([a20cb8e](https://github.com/ParsePlatform/parse-dashboard/commit/a20cb8e534d3fecd8d337463864b15048772a9a5))
* Add visual configurator for Parse Dashboard settings ([#2406](https://github.com/ParsePlatform/parse-dashboard/issues/2406)) ([228d839](https://github.com/ParsePlatform/parse-dashboard/commit/228d83903fd8698da7b96a5b74699f3ff2d5dad4))

# [5.2.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0...5.2.0-beta.1) (2023-05-01)


### Bug Fixes

* Uncaught error when editing Number field in Edit Row dialog ([#2401](https://github.com/ParsePlatform/parse-dashboard/issues/2401)) ([26bd6fa](https://github.com/ParsePlatform/parse-dashboard/commit/26bd6fa39be1076621856a9c86dcd1307f8f7fdd))

### Features

* Data types and pointer classes are sorted alphabetically in dialog to add new column ([#2400](https://github.com/ParsePlatform/parse-dashboard/issues/2400)) ([d9d285b](https://github.com/ParsePlatform/parse-dashboard/commit/d9d285b7f90434d3bb138c2c765272498e3f09c3))
* Sort Cloud Code Jobs alphabetically ([#2402](https://github.com/ParsePlatform/parse-dashboard/issues/2402)) ([77fc372](https://github.com/ParsePlatform/parse-dashboard/commit/77fc372bedb9fb4eca728c1bc076e823c5bc3a2c))

# [5.1.0-beta.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-beta.1...5.1.0-beta.2) (2023-03-01)


### Bug Fixes

* Add dashboard option `cookieSessionMaxAge` to keep user logged in across browser sessions ([#2366](https://github.com/ParsePlatform/parse-dashboard/issues/2366)) ([9ea95fc](https://github.com/ParsePlatform/parse-dashboard/commit/9ea95fc62103b52cf4fac1d1b567334b5298b318))
* Blank screen shown if server is unreachable; unsupported pages are accessible via direct URLs ([#2363](https://github.com/ParsePlatform/parse-dashboard/issues/2363)) ([9855258](https://github.com/ParsePlatform/parse-dashboard/commit/98552584df4d8d75d65d3e394b4acad522117a96))
* Dashboard may display blank page when selecting an app after login ([#2375](https://github.com/ParsePlatform/parse-dashboard/issues/2375)) ([f399b91](https://github.com/ParsePlatform/parse-dashboard/commit/f399b913490f15a0d3be8dde7242dd0b825fa02e))
* Data browser dialog "No data to display" may be outside of visible area in Safari browser ([#2387](https://github.com/ParsePlatform/parse-dashboard/issues/2387)) ([52bba62](https://github.com/ParsePlatform/parse-dashboard/commit/52bba6246cd05c255ca562dcb32da5b104f9908e))
* Internal error message on login with missing credential ([#2370](https://github.com/ParsePlatform/parse-dashboard/issues/2370)) ([9a6a31f](https://github.com/ParsePlatform/parse-dashboard/commit/9a6a31f7d45d1402bfc3a988bef21c4a5bb1b123))
* Navigation to page fails if user re-login is required ([#2369](https://github.com/ParsePlatform/parse-dashboard/issues/2369)) ([0db6f55](https://github.com/ParsePlatform/parse-dashboard/commit/0db6f5559f9b7bb1f5a282c6182810ca89945032))
* Screen goes blank when trying to add column of type `Object` or `GeoPoint` ([#2384](https://github.com/ParsePlatform/parse-dashboard/issues/2384)) ([0886386](https://github.com/ParsePlatform/parse-dashboard/commit/08863868b90455116232b2b73a39391ba990c30c))
* Text selection not visible in modal dialog header ([#2340](https://github.com/ParsePlatform/parse-dashboard/issues/2340)) ([fb0e79c](https://github.com/ParsePlatform/parse-dashboard/commit/fb0e79c0837c3acce27524e798e02da667cbc5a3))

### Features

* Add export all rows of a class and export in JSON format ([#2361](https://github.com/ParsePlatform/parse-dashboard/issues/2361)) ([9eb36a1](https://github.com/ParsePlatform/parse-dashboard/commit/9eb36a183b8b337960f6e8563ad686958001a22b))
* Add schema export ([#2362](https://github.com/ParsePlatform/parse-dashboard/issues/2362)) ([33df049](https://github.com/ParsePlatform/parse-dashboard/commit/33df0495a02c4e77f48b3566032bf5686227cce7))

# [5.1.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0...5.1.0-beta.1) (2022-11-01)


### Features

* remove limitation to refresh Cloud Jobs list only after 30 seconds ([#2332](https://github.com/ParsePlatform/parse-dashboard/issues/2332)) ([ad1132f](https://github.com/ParsePlatform/parse-dashboard/commit/ad1132fb13e854a030e769fdf7689f35d363031d))

# [5.0.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0...5.0.0-beta.1) (2022-10-17)


### Bug Fixes

* increase required Node engine version to `>=14.20.1`; this is a breaking change, but will be published as a patch version because the change should have been done with the release of `5.0.0-alpha.1` which has just been released ([#2281](https://github.com/ParsePlatform/parse-dashboard/issues/2281)) ([50de52b](https://github.com/ParsePlatform/parse-dashboard/commit/50de52b6dddad079224e3c3b21ed16f4df347a33))
* minor UI layout issues ([#2270](https://github.com/ParsePlatform/parse-dashboard/issues/2270)) ([51d083b](https://github.com/ParsePlatform/parse-dashboard/commit/51d083b218d1291fc27ee2a5f1727c5f2a1dc7d4))
* raw value of read-only date field in data browser cannot be copied ([#2326](https://github.com/ParsePlatform/parse-dashboard/issues/2326)) ([4af7b98](https://github.com/ParsePlatform/parse-dashboard/commit/4af7b981ec1c8356c33215a49f3757a4005525a1))
* using browser navigation backward / forward button clears data browser ([#2317](https://github.com/ParsePlatform/parse-dashboard/issues/2317)) ([7d9b957](https://github.com/ParsePlatform/parse-dashboard/commit/7d9b9575184d7b03fac0e74fa785409af399d314))

### Features

* improve distinction between deletion confirmation dialogs ([#2319](https://github.com/ParsePlatform/parse-dashboard/issues/2319)) ([23c12ff](https://github.com/ParsePlatform/parse-dashboard/commit/23c12ffbd49508de5c6e5e6155e6720e9f960fc5))
* keep entered filter value when changing filter operator ([#2313](https://github.com/ParsePlatform/parse-dashboard/issues/2313)) ([d6d38bf](https://github.com/ParsePlatform/parse-dashboard/commit/d6d38bfc2b06360c6a1ecc990f937cd675d1ff39))
* remove Node 12 support ([#2277](https://github.com/ParsePlatform/parse-dashboard/issues/2277)) ([18b0e76](https://github.com/ParsePlatform/parse-dashboard/commit/18b0e76e28938f4cb3eaaed7ba3292fc622a35c7))


### BREAKING CHANGES

* This version removes support for Node 12; the new minimum required Node version is 14. ([18b0e76](18b0e76))

# [4.2.0-beta.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-beta.1...4.2.0-beta.2) (2022-09-27)


### Bug Fixes

* column names in data browser menu not left-aligned ([#2263](https://github.com/ParsePlatform/parse-dashboard/issues/2263)) ([fc5673a](https://github.com/ParsePlatform/parse-dashboard/commit/fc5673a0ebbc7b4d51e122dbb71172803513309e))
* context menu in data browser is not scrollable ([#2271](https://github.com/ParsePlatform/parse-dashboard/issues/2271)) ([6c54bd8](https://github.com/ParsePlatform/parse-dashboard/commit/6c54bd82b872d5efed827c3582b4fb3f0aa24a95))
* dashboard contains invalid html for top-level document ([#2254](https://github.com/ParsePlatform/parse-dashboard/issues/2254)) ([bbce857](https://github.com/ParsePlatform/parse-dashboard/commit/bbce8579ef634bf8e6800f3a6ab8cd650e971695))
* file upload dialog in data browser shows multiple times ([#2276](https://github.com/ParsePlatform/parse-dashboard/issues/2276)) ([3927340](https://github.com/ParsePlatform/parse-dashboard/commit/39273403568f7ca13a349cac53fbb6a99d8823cc))
* login fails with error `req.session.regenerate is not a function` ([#2260](https://github.com/ParsePlatform/parse-dashboard/issues/2260)) ([1dc2b91](https://github.com/ParsePlatform/parse-dashboard/commit/1dc2b915e16a2038268f886d4c24e7b081ae0531))
* unnecessary count operations in Data Browser ([#2250](https://github.com/ParsePlatform/parse-dashboard/issues/2250)) ([bfc1684](https://github.com/ParsePlatform/parse-dashboard/commit/bfc1684375b7c2120e2a4ae566e5b3c38c0ca110))
* view relation dialog requires browser refresh when navigating ([#2275](https://github.com/ParsePlatform/parse-dashboard/issues/2275)) ([d60a8b7](https://github.com/ParsePlatform/parse-dashboard/commit/d60a8b7c1ab6c4c8dd85051d9c1acb05a0a69a59))

### Features

* add column name to related records ([#2264](https://github.com/ParsePlatform/parse-dashboard/issues/2264)) ([cc82533](https://github.com/ParsePlatform/parse-dashboard/commit/cc82533ae3066daa7b789131a76a409720d45b0b))
* add Node 18 support ([#2206](https://github.com/ParsePlatform/parse-dashboard/issues/2206)) ([bc7895a](https://github.com/ParsePlatform/parse-dashboard/commit/bc7895aadacc2cc6b0bbcfe786b73d7b82527e55))
* add option to auto-sort columns alphabetically ([#2252](https://github.com/ParsePlatform/parse-dashboard/issues/2252)) ([2b7f20f](https://github.com/ParsePlatform/parse-dashboard/commit/2b7f20fcc088f74915b50ec1219038ba9b233c27))
* apply filter in data browser by pressing "Enter" key ([#2256](https://github.com/ParsePlatform/parse-dashboard/issues/2256)) ([bc4f9eb](https://github.com/ParsePlatform/parse-dashboard/commit/bc4f9eb9cad9eb8e362dca20bf932cb3d1e6721c))
* auto-submit one-time password (OTP) after entering ([#2257](https://github.com/ParsePlatform/parse-dashboard/issues/2257)) ([e528705](https://github.com/ParsePlatform/parse-dashboard/commit/e5287054cff3bff368ba4e379eebf05bfb7d8bd5))
* show skeleton as loading indicator in data browser while data is loading ([#2273](https://github.com/ParsePlatform/parse-dashboard/issues/2273)) ([059f616](https://github.com/ParsePlatform/parse-dashboard/commit/059f616718006c6f559b0b07a8da641367497d9a))

# [4.2.0-beta.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.3...4.2.0-beta.1) (2022-09-02)


### Bug Fixes

* button text "Show all" in column menu is truncated ([#2208](https://github.com/ParsePlatform/parse-dashboard/issues/2208)) ([b89d044](https://github.com/ParsePlatform/parse-dashboard/commit/b89d044a504c6748932907f075819a13aa08fb51))
* login fails with error `req.session.regenerate is not a function` ([#2195](https://github.com/ParsePlatform/parse-dashboard/issues/2195)) [skip release] ([31a2b78](https://github.com/ParsePlatform/parse-dashboard/commit/31a2b7813531e370e11b1a050ea28b575a058816))
* login fails with error `req.session.regenerate is not a function` ([#2197](https://github.com/ParsePlatform/parse-dashboard/issues/2197)) [skip release] ([014d9c1](https://github.com/ParsePlatform/parse-dashboard/commit/014d9c15b0c4efad8b0762e5a49f6a740ead5edb))
* security upgrade terser from 5.10.0 to 5.14.2 ([#2222](https://github.com/ParsePlatform/parse-dashboard/issues/2222)) ([645cfdd](https://github.com/ParsePlatform/parse-dashboard/commit/645cfdd5939aca429b988e7a7c1a1b6a68230810))

### Features

* improve button labels to be more concise in text ([#2207](https://github.com/ParsePlatform/parse-dashboard/issues/2207)) ([230fc14](https://github.com/ParsePlatform/parse-dashboard/commit/230fc1419db4d4de67c7e591cde415dbbe461c84))
* remove support and documentation links ([#2203](https://github.com/ParsePlatform/parse-dashboard/issues/2203)) ([35e4476](https://github.com/ParsePlatform/parse-dashboard/commit/35e44768f65c64a228cb6ea8314aa534c5342f08))

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
