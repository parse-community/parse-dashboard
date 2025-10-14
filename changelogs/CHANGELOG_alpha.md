# [7.6.0-alpha.10](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.9...7.6.0-alpha.10) (2025-10-14)


### Bug Fixes

* ESC key does not cancel editing in data browser cell ([#3001](https://github.com/parse-community/parse-dashboard/issues/3001)) ([d1d7241](https://github.com/parse-community/parse-dashboard/commit/d1d724169ae12489fb30eeca558e4cc926e4d851))

# [7.6.0-alpha.9](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.8...7.6.0-alpha.9) (2025-10-14)


### Bug Fixes

* Security upgrade passport from 0.5.3 to 0.6.0 ([#3000](https://github.com/parse-community/parse-dashboard/issues/3000)) ([fbb5e6d](https://github.com/parse-community/parse-dashboard/commit/fbb5e6d9df5575519d414b98481afd96a4ae11d8))

# [7.6.0-alpha.8](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.7...7.6.0-alpha.8) (2025-10-05)


### Performance Improvements

* Storing, deleting, modifying view in server storage now only affects the specific view instead of updating all views ([#2998](https://github.com/parse-community/parse-dashboard/issues/2998)) ([48cea3c](https://github.com/parse-community/parse-dashboard/commit/48cea3c06001fe74be2990bc65036b5111f943b2))

# [7.6.0-alpha.7](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.6...7.6.0-alpha.7) (2025-10-05)


### Bug Fixes

* Dashboard config objects stored on server with public read / write access ([#2997](https://github.com/parse-community/parse-dashboard/issues/2997)) ([31a4639](https://github.com/parse-community/parse-dashboard/commit/31a4639bb44fa7223d669aa40580b2348420f522))

# [7.6.0-alpha.6](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.5...7.6.0-alpha.6) (2025-10-05)


### Bug Fixes

* Storing view on server creates view key with hashed view name instead of UUID ([#2995](https://github.com/parse-community/parse-dashboard/issues/2995)) ([7cb65f3](https://github.com/parse-community/parse-dashboard/commit/7cb65f360a2cd7f57782dad408c606671e271c7d))

# [7.6.0-alpha.5](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.4...7.6.0-alpha.5) (2025-10-05)


### Bug Fixes

* View table data may be retained when switching between views ([#2996](https://github.com/parse-community/parse-dashboard/issues/2996)) ([ddc91c9](https://github.com/parse-community/parse-dashboard/commit/ddc91c991f8ef6ea2695448cdb10edec71c8ad1a))

# [7.6.0-alpha.4](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.3...7.6.0-alpha.4) (2025-10-05)


### Bug Fixes

* Missing alert when changing data browser browser data while rows are selected ([#2994](https://github.com/parse-community/parse-dashboard/issues/2994)) ([6cabaa3](https://github.com/parse-community/parse-dashboard/commit/6cabaa36a95b0059ebbcd7b90a744fa9d0a403af))

# [7.6.0-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.2...7.6.0-alpha.3) (2025-10-04)


### Bug Fixes

* Filter text field in data browser partly looses focus when selecting in drop-down element by hitting enter key to apply filter ([#2993](https://github.com/parse-community/parse-dashboard/issues/2993)) ([f4c17c7](https://github.com/parse-community/parse-dashboard/commit/f4c17c7d9046d9296c7cd9cb99109cad8c8a0e5b))

# [7.6.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.6.0-alpha.1...7.6.0-alpha.2) (2025-10-04)


### Bug Fixes

* Filter text field in data browser partly looses focus when hitting enter key to apply filter ([#2992](https://github.com/parse-community/parse-dashboard/issues/2992)) ([e3085b9](https://github.com/parse-community/parse-dashboard/commit/e3085b9f62af359c04ce74498eb2029bce85a5d1))

# [7.6.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.5.0...7.6.0-alpha.1) (2025-10-04)


### Features

* Add `matches regex` filter to data browser replacing limited `string contains string` filter ([#2991](https://github.com/parse-community/parse-dashboard/issues/2991)) ([64a9f71](https://github.com/parse-community/parse-dashboard/commit/64a9f71bf89a818a7cf69573f652f554cac6a751))

# [7.5.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.5.0-alpha.1...7.5.0-alpha.2) (2025-09-11)


### Features

* Add data browser filter condition `containedIn` ([#2979](https://github.com/parse-community/parse-dashboard/issues/2979)) ([c1dc5bb](https://github.com/parse-community/parse-dashboard/commit/c1dc5bb81823923596e2e1c5c8545ff5cded7856))

# [7.5.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.4.0...7.5.0-alpha.1) (2025-09-09)


### Features

* Add button to view table to open all pointers of a column in new browser tabs ([#2976](https://github.com/parse-community/parse-dashboard/issues/2976)) ([b8033a4](https://github.com/parse-community/parse-dashboard/commit/b8033a46f519ad98a1c8e59fe4c868aa65b5840c))

# [7.4.0-alpha.5](https://github.com/parse-community/parse-dashboard/compare/7.4.0-alpha.4...7.4.0-alpha.5) (2025-08-22)


### Features

* Add info panel setting to auto-load first row on opening new browser tab ([#2972](https://github.com/parse-community/parse-dashboard/issues/2972)) ([020a25d](https://github.com/parse-community/parse-dashboard/commit/020a25dc302e45e947eb5c15a271bb9f0f1211f2))

# [7.4.0-alpha.4](https://github.com/parse-community/parse-dashboard/compare/7.4.0-alpha.3...7.4.0-alpha.4) (2025-08-22)


### Features

* Add config parameter name to quick add dialogs in Config page ([#2970](https://github.com/parse-community/parse-dashboard/issues/2970)) ([31988f6](https://github.com/parse-community/parse-dashboard/commit/31988f68cda16856b0c6afb22e4f06321cbcef03))

# [7.4.0-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.4.0-alpha.2...7.4.0-alpha.3) (2025-08-04)


### Bug Fixes

* Legacy script in JavaScript console not imported to modern console ([#2963](https://github.com/parse-community/parse-dashboard/issues/2963)) ([8c8d084](https://github.com/parse-community/parse-dashboard/commit/8c8d0849521eccd23e590c57ca91069bb32c5035))

# [7.4.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.4.0-alpha.1...7.4.0-alpha.2) (2025-08-04)


### Features

* Modernize JavaScript console with tabs and server-side storage of scripts ([#2962](https://github.com/parse-community/parse-dashboard/issues/2962)) ([6e0c7f2](https://github.com/parse-community/parse-dashboard/commit/6e0c7f25b16fdfc0a34123359a8512c26252f269))

# [7.4.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.3.0...7.4.0-alpha.1) (2025-08-03)


### Features

* Add App Settings option to store dashboard settings on server ([#2958](https://github.com/parse-community/parse-dashboard/issues/2958)) ([666e078](https://github.com/parse-community/parse-dashboard/commit/666e07860ba1478aec3cde9db5c98a5772ea07fb))

# [7.3.0-alpha.44](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.43...7.3.0-alpha.44) (2025-07-31)


### Features

* Add environment variable support for AI agent configuration ([#2956](https://github.com/parse-community/parse-dashboard/issues/2956)) ([2ac9e7e](https://github.com/parse-community/parse-dashboard/commit/2ac9e7e13cec0edb085d582ef1c67bd7e8468ac5))

# [7.3.0-alpha.43](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.42...7.3.0-alpha.43) (2025-07-31)


### Bug Fixes

* Header checkbox in data browser does not indicate when a few rows are selected ([#2957](https://github.com/parse-community/parse-dashboard/issues/2957)) ([e4ab666](https://github.com/parse-community/parse-dashboard/commit/e4ab66643085ab98d484aa0c484d0f66da7ed6d4))

# [7.3.0-alpha.42](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.41...7.3.0-alpha.42) (2025-07-29)


### Features

* Add AI agent for natural language interaction with Parse Server ([#2954](https://github.com/parse-community/parse-dashboard/issues/2954)) ([32bd6e8](https://github.com/parse-community/parse-dashboard/commit/32bd6e855c67e3d4aa2fa4d8e8c3e076969486d0))

# [7.3.0-alpha.41](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.40...7.3.0-alpha.41) (2025-07-28)


### Features

* Add support for `Image` type in View table to display images ([#2952](https://github.com/parse-community/parse-dashboard/issues/2952)) ([6a6b1f0](https://github.com/parse-community/parse-dashboard/commit/6a6b1f02d546a3271493d4088bf356543b2c0394))

# [7.3.0-alpha.40](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.39...7.3.0-alpha.40) (2025-07-27)


### Bug Fixes

* Selected text in info panel cannot be copied using Ctrl+C ([#2951](https://github.com/parse-community/parse-dashboard/issues/2951)) ([0164c19](https://github.com/parse-community/parse-dashboard/commit/0164c1939cbb4ada991dc488ef2cd156913353d0))

# [7.3.0-alpha.39](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.38...7.3.0-alpha.39) (2025-07-27)


### Bug Fixes

* Class object counters in sidebar not updating ([#2950](https://github.com/parse-community/parse-dashboard/issues/2950)) ([0f1920b](https://github.com/parse-community/parse-dashboard/commit/0f1920b448787e57482c821b881c732f57fec614))

# [7.3.0-alpha.38](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.37...7.3.0-alpha.38) (2025-07-27)


### Features

* Allow editing filter without loading data in data browser ([#2949](https://github.com/parse-community/parse-dashboard/issues/2949)) ([9623580](https://github.com/parse-community/parse-dashboard/commit/962358020c513d38a1bc175545f73aebc92d403a))

# [7.3.0-alpha.37](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.36...7.3.0-alpha.37) (2025-07-27)


### Bug Fixes

* Saved legacy filter with classname in query cannot be deleted ([#2948](https://github.com/parse-community/parse-dashboard/issues/2948)) ([05ee5b3](https://github.com/parse-community/parse-dashboard/commit/05ee5b39e91737343ae4395cb63736802bd5c6cb))

# [7.3.0-alpha.36](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.35...7.3.0-alpha.36) (2025-07-27)


### Bug Fixes

* Changing "Relative dates" option of saved filter does not enable save button ([#2947](https://github.com/parse-community/parse-dashboard/issues/2947)) ([4f4977d](https://github.com/parse-community/parse-dashboard/commit/4f4977dbb16fbf755584355d90b85d9efc9169fd))

# [7.3.0-alpha.35](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.34...7.3.0-alpha.35) (2025-07-27)


### Bug Fixes

* Legacy filters without `filterId` cannot be deleted in data browser ([#2946](https://github.com/parse-community/parse-dashboard/issues/2946)) ([65df9d6](https://github.com/parse-community/parse-dashboard/commit/65df9d60c080d100fac45c7a81cae83104f150ea))

# [7.3.0-alpha.34](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.33...7.3.0-alpha.34) (2025-07-26)


### Bug Fixes

* Legacy filters without `filterId` do not appear in sidebar ([#2945](https://github.com/parse-community/parse-dashboard/issues/2945)) ([fde3769](https://github.com/parse-community/parse-dashboard/commit/fde376923dc5a7ada689b5a35c54065c90870070))

# [7.3.0-alpha.33](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.32...7.3.0-alpha.33) (2025-07-26)


### Bug Fixes

* Saved legacy filter in data browser cannot be deleted or cloned ([#2944](https://github.com/parse-community/parse-dashboard/issues/2944)) ([15da90d](https://github.com/parse-community/parse-dashboard/commit/15da90d05bf8cde6cc383a3f9bd060d48214ccc6))

# [7.3.0-alpha.32](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.31...7.3.0-alpha.32) (2025-07-26)


### Bug Fixes

* Views not sorted alphabetically in sidebar ([#2943](https://github.com/parse-community/parse-dashboard/issues/2943)) ([4c81fe4](https://github.com/parse-community/parse-dashboard/commit/4c81fe423a9d437d0563285c9f67b13f8c7582ec))

# [7.3.0-alpha.31](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.30...7.3.0-alpha.31) (2025-07-26)


### Features

* Allow editing saved filters in data browser ([#2942](https://github.com/parse-community/parse-dashboard/issues/2942)) ([daaccaa](https://github.com/parse-community/parse-dashboard/commit/daaccaac75a0dad2082fb32abf1eb5f0cec17af7))

# [7.3.0-alpha.30](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.29...7.3.0-alpha.30) (2025-07-24)


### Bug Fixes

* Move settings button on data browser toolbar for better UI ([#2940](https://github.com/parse-community/parse-dashboard/issues/2940)) ([c473ce6](https://github.com/parse-community/parse-dashboard/commit/c473ce6153f12c1eebcb7467d185b9f7482d42a8))

# [7.3.0-alpha.29](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.28...7.3.0-alpha.29) (2025-07-24)


### Features

* Add Cloud Function as data source for views with optional text or file upload ([#2939](https://github.com/parse-community/parse-dashboard/issues/2939)) ([f5831c7](https://github.com/parse-community/parse-dashboard/commit/f5831c71b16c135b6bc51dd2ff37991d2b2b57f9))

# [7.3.0-alpha.28](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.27...7.3.0-alpha.28) (2025-07-24)


### Bug Fixes

* Info panel scroll-to-top setting not persistent across dashboard sessions ([#2938](https://github.com/parse-community/parse-dashboard/issues/2938)) ([2b78087](https://github.com/parse-community/parse-dashboard/commit/2b7808766516a6833236c5a0721084f3ffe026b0))

# [7.3.0-alpha.27](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.26...7.3.0-alpha.27) (2025-07-24)


### Features

* Add Settings menu to scroll info panel to top when browsing through rows ([#2937](https://github.com/parse-community/parse-dashboard/issues/2937)) ([f339cb8](https://github.com/parse-community/parse-dashboard/commit/f339cb8d7a94ccda765c0d50ae00b57a53e03d7e))

# [7.3.0-alpha.26](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.25...7.3.0-alpha.26) (2025-07-20)


### Bug Fixes

* Incorrect table cell width in App Settings table ([#2933](https://github.com/parse-community/parse-dashboard/issues/2933)) ([d46765b](https://github.com/parse-community/parse-dashboard/commit/d46765b16abfe3eda6d77525ae2f95a6f4be620c))

# [7.3.0-alpha.25](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.24...7.3.0-alpha.25) (2025-07-19)


### Bug Fixes

* Modal text input can be resized smaller than its cell in Safari browser ([#2930](https://github.com/parse-community/parse-dashboard/issues/2930)) ([82a0cdc](https://github.com/parse-community/parse-dashboard/commit/82a0cdc397d58494c0c61a8241767d4930f742f1))

# [7.3.0-alpha.24](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.23...7.3.0-alpha.24) (2025-07-19)


### Features

* Add inclusive date filters "is on or after", "is on or before" in data browser ([#2929](https://github.com/parse-community/parse-dashboard/issues/2929)) ([c8d621b](https://github.com/parse-community/parse-dashboard/commit/c8d621b6e173621a01ee081b002f0673c4d90d91))

# [7.3.0-alpha.23](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.22...7.3.0-alpha.23) (2025-07-19)


### Bug Fixes

* Hyperlink in Views table ignores `urlQuery` key ([#2926](https://github.com/parse-community/parse-dashboard/issues/2926)) ([c5eedf4](https://github.com/parse-community/parse-dashboard/commit/c5eedf4c0d3db6572ba47838970d259ce1e7e11f))

# [7.3.0-alpha.22](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.21...7.3.0-alpha.22) (2025-07-19)


### Features

* Add hyperlink support in Views table ([#2925](https://github.com/parse-community/parse-dashboard/issues/2925)) ([06cfc11](https://github.com/parse-community/parse-dashboard/commit/06cfc11f6e62d2da99882dbf659bd7c6428f06ce))

# [7.3.0-alpha.21](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.20...7.3.0-alpha.21) (2025-07-18)


### Performance Improvements

* Add config option `enableResourceCache` to cache dashboard resources locally for faster loading in additional browser tabs ([#2920](https://github.com/parse-community/parse-dashboard/issues/2920)) ([41a4963](https://github.com/parse-community/parse-dashboard/commit/41a4963ce6068e6f14a6a6008812ac3c1821e0fb))

# [7.3.0-alpha.20](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.19...7.3.0-alpha.20) (2025-07-17)


### Features

* Prefetch info panel data with config options `prefetchObjects` and `prefetchStale` ([#2915](https://github.com/parse-community/parse-dashboard/issues/2915)) ([54a8156](https://github.com/parse-community/parse-dashboard/commit/54a8156994a4c720b9f09d9f97ac4342d8039a77))

# [7.3.0-alpha.19](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.18...7.3.0-alpha.19) (2025-07-17)


### Features

* Add support for "not equal to" filter for Boolean values in data browser and analytics explorer ([#2914](https://github.com/parse-community/parse-dashboard/issues/2914)) ([d55b89c](https://github.com/parse-community/parse-dashboard/commit/d55b89c34caee7490eaf78787d28bc8cdbeedbe8))

# [7.3.0-alpha.18](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.17...7.3.0-alpha.18) (2025-07-16)


### Features

* Allow freeform text view resizing in modal dialogs ([#2910](https://github.com/parse-community/parse-dashboard/issues/2910)) ([1399162](https://github.com/parse-community/parse-dashboard/commit/139916211113dec14a835fea50838e495dc15077))

# [7.3.0-alpha.17](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.16...7.3.0-alpha.17) (2025-07-16)


### Bug Fixes

* Race condition on info panel request shows info panel data not corresponding to selected cell ([#2909](https://github.com/parse-community/parse-dashboard/issues/2909)) ([6f45bb3](https://github.com/parse-community/parse-dashboard/commit/6f45bb348def3cf297e869bc58bb5edcd5ad2d60))

# [7.3.0-alpha.16](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.15...7.3.0-alpha.16) (2025-07-16)


### Features

* Persist info panel visibility when navigating across classes in data browser ([#2908](https://github.com/parse-community/parse-dashboard/issues/2908)) ([1a3610a](https://github.com/parse-community/parse-dashboard/commit/1a3610a4632be78353db4f511781ca7757a12361))

# [7.3.0-alpha.15](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.14...7.3.0-alpha.15) (2025-07-15)


### Features

* Add additional values in info panel key-value element ([#2904](https://github.com/parse-community/parse-dashboard/issues/2904)) ([a8f110e](https://github.com/parse-community/parse-dashboard/commit/a8f110e1349e8b51927be0386f8dd1a4a031fd6b))

# [7.3.0-alpha.14](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.13...7.3.0-alpha.14) (2025-07-14)


### Bug Fixes

* Clicking linked pointer with Cmd key in view table doesn't open page in new browser tab ([#2902](https://github.com/parse-community/parse-dashboard/issues/2902)) ([101b194](https://github.com/parse-community/parse-dashboard/commit/101b1943b01367402b2bbab61cabf2c267540c3e))

# [7.3.0-alpha.13](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.12...7.3.0-alpha.13) (2025-07-14)


### Features

* Add view edit icon to views list in sidebar ([#2901](https://github.com/parse-community/parse-dashboard/issues/2901)) ([96e33b9](https://github.com/parse-community/parse-dashboard/commit/96e33b9f59fb590b0a4041d0b87cf8820c5551ff))

# [7.3.0-alpha.12](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.11...7.3.0-alpha.12) (2025-07-13)


### Bug Fixes

* Warning dialog is shown after executing script on selected rows ([#2899](https://github.com/parse-community/parse-dashboard/issues/2899)) ([027f1ed](https://github.com/parse-community/parse-dashboard/commit/027f1edacaa74b67e9e28bbb039465b075fcf6b4))

# [7.3.0-alpha.11](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.10...7.3.0-alpha.11) (2025-07-13)


### Features

* Add custom data views with aggregation query ([#2888](https://github.com/parse-community/parse-dashboard/issues/2888)) ([b1679db](https://github.com/parse-community/parse-dashboard/commit/b1679db1210a52c8c5299eb4b66e33f96963311e))

# [7.3.0-alpha.10](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.9...7.3.0-alpha.10) (2025-07-10)


### Features

* Warn when leaving data browser page with selected rows ([#2887](https://github.com/parse-community/parse-dashboard/issues/2887)) ([206ead1](https://github.com/parse-community/parse-dashboard/commit/206ead15fec0a505a3efcf9c50b78fa4d0561234))

# [7.3.0-alpha.9](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.8...7.3.0-alpha.9) (2025-07-09)


### Bug Fixes

* Fails to generate MFA code with CLI command `parse-dashboard --createMFA` ([#2883](https://github.com/parse-community/parse-dashboard/issues/2883)) ([544df1f](https://github.com/parse-community/parse-dashboard/commit/544df1ff606d45693596bc20179d129d6a9c91f1))

# [7.3.0-alpha.8](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.7...7.3.0-alpha.8) (2025-07-09)


### Bug Fixes

* Invalid clipboard content for multi-cell copy in data browser ([#2882](https://github.com/parse-community/parse-dashboard/issues/2882)) ([22a2065](https://github.com/parse-community/parse-dashboard/commit/22a206501e4ca77dc0bb2a845b9cdf2bd3653b81))

# [7.3.0-alpha.7](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.6...7.3.0-alpha.7) (2025-07-09)


### Bug Fixes

* Pagination footer bar hides rows in data browser ([#2879](https://github.com/parse-community/parse-dashboard/issues/2879)) ([6bc2da8](https://github.com/parse-community/parse-dashboard/commit/6bc2da848f970ae50cc5de0a9b1d16a04e2c88ae))

# [7.3.0-alpha.6](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.5...7.3.0-alpha.6) (2025-07-09)


### Features

* Add row number column to data browser ([#2878](https://github.com/parse-community/parse-dashboard/issues/2878)) ([c0aa407](https://github.com/parse-community/parse-dashboard/commit/c0aa4072bd3dee4dcddaa3527de97479354683e5))

# [7.3.0-alpha.5](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.4...7.3.0-alpha.5) (2025-07-09)


### Bug Fixes

* Gracefully fail when trying to get new features in latest version of dashboard ([#2880](https://github.com/parse-community/parse-dashboard/issues/2880)) ([1969a0e](https://github.com/parse-community/parse-dashboard/commit/1969a0e826832179bcd8d5e5ea56e8d63ad84dd4))

# [7.3.0-alpha.4](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.3...7.3.0-alpha.4) (2025-07-09)


### Features

* Add column freezing in data browser ([#2877](https://github.com/parse-community/parse-dashboard/issues/2877)) ([29f4a88](https://github.com/parse-community/parse-dashboard/commit/29f4a88dc8dc4c9e1673cfbbbbd39db37231f983))

# [7.3.0-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.2...7.3.0-alpha.3) (2025-07-09)


### Features

* Add type mismatch warning when quick-adding entry to Cloud Config array parameter ([#2875](https://github.com/parse-community/parse-dashboard/issues/2875)) ([bb1837f](https://github.com/parse-community/parse-dashboard/commit/bb1837fd7af64e75364b53210dd710bc70d0e764))

# [7.3.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.3.0-alpha.1...7.3.0-alpha.2) (2025-07-07)


### Features

* Add clipboard icon to copy value of key-value element in info panel ([#2871](https://github.com/parse-community/parse-dashboard/issues/2871)) ([7862c42](https://github.com/parse-community/parse-dashboard/commit/7862c42e58bb8296635f3df1036eb5348f8897fa))

# [7.3.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.2.1...7.3.0-alpha.1) (2025-07-07)


### Features

* Add quick-add button to array parameter in Cloud Config ([#2866](https://github.com/parse-community/parse-dashboard/issues/2866)) ([e98ccb2](https://github.com/parse-community/parse-dashboard/commit/e98ccb236459d891b60383fa3e040b212ac07044))

## [7.2.1-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.2.0...7.2.1-alpha.1) (2025-06-02)


### Bug Fixes

* Data browser does not cancel obsolete long-loading request on sorting field change ([#2839](https://github.com/parse-community/parse-dashboard/issues/2839)) ([0f85376](https://github.com/parse-community/parse-dashboard/commit/0f85376b8ae1db7ae31626896b06fdc0bd8efd75))

# [7.2.0-alpha.9](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.8...7.2.0-alpha.9) (2025-05-27)


### Features

* Add script execution on parallel batches with option `script.executionBatchSize` ([#2828](https://github.com/parse-community/parse-dashboard/issues/2828)) ([cee8b8d](https://github.com/parse-community/parse-dashboard/commit/cee8b8dd12bc44a352e43073aed65782277841dd))

# [7.2.0-alpha.8](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.7...7.2.0-alpha.8) (2025-05-25)


### Bug Fixes

* Notifications fade out erratically when executing a script on large number of rows ([#2822](https://github.com/parse-community/parse-dashboard/issues/2822)) ([3891381](https://github.com/parse-community/parse-dashboard/commit/38913813f0f3252b241a322aaf50142d5564201a))

# [7.2.0-alpha.7](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.6...7.2.0-alpha.7) (2025-05-25)


### Bug Fixes

* Data browser not scrolling to top when changing filter while cell selected ([#2821](https://github.com/parse-community/parse-dashboard/issues/2821)) ([c2527dc](https://github.com/parse-community/parse-dashboard/commit/c2527dc1d3e084dcab3d52955bae7760bb27da36))

# [7.2.0-alpha.6](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.5...7.2.0-alpha.6) (2025-05-24)


### Features

* Add relative date filter in data browser for date constraints relative to when the query is run ([#2736](https://github.com/parse-community/parse-dashboard/issues/2736)) ([d9dfd69](https://github.com/parse-community/parse-dashboard/commit/d9dfd69b0fcef01456f1feee9b939b7504113e29))

# [7.2.0-alpha.5](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.4...7.2.0-alpha.5) (2025-05-24)


### Features

* Add confirmation dialog before saving a Cloud Config parameter that has been modified since editing it ([#2770](https://github.com/parse-community/parse-dashboard/issues/2770)) ([adb9b5c](https://github.com/parse-community/parse-dashboard/commit/adb9b5c34c7e6cb02d63ad35fbcca8ea9544e36c))

# [7.2.0-alpha.4](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.3...7.2.0-alpha.4) (2025-05-24)


### Bug Fixes

* Improperly aligned unfolding sub-items in context menu in data browser ([#2726](https://github.com/parse-community/parse-dashboard/issues/2726)) ([3fed292](https://github.com/parse-community/parse-dashboard/commit/3fed292b70f9400d4fb09b44d215de377d568c03))

# [7.2.0-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.2...7.2.0-alpha.3) (2025-05-19)


### Features

* Keyboard Enter key can be used to select item in data browser filter dialog field dropdown ([#2771](https://github.com/parse-community/parse-dashboard/issues/2771)) ([dc14710](https://github.com/parse-community/parse-dashboard/commit/dc14710b63b0dc79ae52b322c683204941c4cb11))

# [7.2.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.2.0-alpha.1...7.2.0-alpha.2) (2025-05-09)


### Bug Fixes

* Pagination does not reset to page 1 when clicking on class or filter ([#2798](https://github.com/parse-community/parse-dashboard/issues/2798)) ([29d1447](https://github.com/parse-community/parse-dashboard/commit/29d1447509db74c2ddc0c7f01a1cb7c7cd8573ff))

# [7.2.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.1.1-alpha.3...7.2.0-alpha.1) (2025-05-06)


### Features

* Add custom CSS styling for info panel items ([#2788](https://github.com/parse-community/parse-dashboard/issues/2788)) ([f031e5d](https://github.com/parse-community/parse-dashboard/commit/f031e5d4fa509c9fe098d0a6c77e960f79536334))

## [7.1.1-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.1.1-alpha.2...7.1.1-alpha.3) (2025-05-03)


### Bug Fixes

* Selecting a saved filter in data browser may highlight a different filter ([#2783](https://github.com/parse-community/parse-dashboard/issues/2783)) ([4c6e853](https://github.com/parse-community/parse-dashboard/commit/4c6e853f4aa660a8dab61f349f8ccf70572ab8ca))

## [7.1.1-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.1.1-alpha.1...7.1.1-alpha.2) (2025-05-03)


### Bug Fixes

* Data browser table shows loading indicator when info panel is loading ([#2782](https://github.com/parse-community/parse-dashboard/issues/2782)) ([da57e5e](https://github.com/parse-community/parse-dashboard/commit/da57e5ea5ec77abc1bbd4d97ba3a5a30cd82e4a7))

## [7.1.1-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.1.0...7.1.1-alpha.1) (2025-05-02)


### Bug Fixes

* Saving new filter in data browser overwrites filters added in other dashboard instances ([#2769](https://github.com/parse-community/parse-dashboard/issues/2769)) ([46bc154](https://github.com/parse-community/parse-dashboard/commit/46bc154cc008c2d8f8d8248e52ec06b9e64cb779))

# [7.1.0-alpha.12](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.11...7.1.0-alpha.12) (2025-04-29)


### Bug Fixes

* Clicking on pointer in data browser when using pagination does not reset to first page ([#2767](https://github.com/parse-community/parse-dashboard/issues/2767)) ([ab512e5](https://github.com/parse-community/parse-dashboard/commit/ab512e52d137cdb30167ece53a9ce12c38f5d155))

# [7.1.0-alpha.11](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.10...7.1.0-alpha.11) (2025-04-28)


### Bug Fixes

* Data loading indicator not showing when using pagination ([#2768](https://github.com/parse-community/parse-dashboard/issues/2768)) ([62d7aec](https://github.com/parse-community/parse-dashboard/commit/62d7aec3c43c634f8dc632ef7a563cfdad5cd773))

# [7.1.0-alpha.10](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.9...7.1.0-alpha.10) (2025-04-17)


### Bug Fixes

* Data browser filters "key exists" and "key does not exist" not working ([#2762](https://github.com/parse-community/parse-dashboard/issues/2762)) ([099eca3](https://github.com/parse-community/parse-dashboard/commit/099eca30be021c6466e4f5279ebd2e6f5cd1c1c3))

# [7.1.0-alpha.9](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.8...7.1.0-alpha.9) (2025-04-17)


### Features

* Display filter list in data browser sorted alphabetically ([#2761](https://github.com/parse-community/parse-dashboard/issues/2761)) ([0209a0d](https://github.com/parse-community/parse-dashboard/commit/0209a0d78a3864ba059444ec5eb4a6d00a0430f4))

# [7.1.0-alpha.8](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.7...7.1.0-alpha.8) (2025-04-17)


### Bug Fixes

* Data browser filters "key exists" and "key does not exist" not working ([#2760](https://github.com/parse-community/parse-dashboard/issues/2760)) ([0691b3c](https://github.com/parse-community/parse-dashboard/commit/0691b3cf30a77421e17299935880c54f9c8c9c32))

# [7.1.0-alpha.7](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.6...7.1.0-alpha.7) (2025-04-17)


### Bug Fixes

* Dashboard crashes on login due to `passport` upgrade ([#2758](https://github.com/parse-community/parse-dashboard/issues/2758)) ([ee74321](https://github.com/parse-community/parse-dashboard/commit/ee743210f67dd9e206e6302f57a5d025099be0b4))

# [7.1.0-alpha.6](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.5...7.1.0-alpha.6) (2025-04-13)


### Bug Fixes

* Dashboard crashes when selecting app ([#2747](https://github.com/parse-community/parse-dashboard/issues/2747)) ([8b0cfea](https://github.com/parse-community/parse-dashboard/commit/8b0cfeae4759eaf41eef3d92aa52c79df2918e54))

# [7.1.0-alpha.5](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.4...7.1.0-alpha.5) (2025-04-06)


### Bug Fixes

* Logout bar layout not aligned with data browser navigation bar ([#2720](https://github.com/parse-community/parse-dashboard/issues/2720)) ([01a2a1c](https://github.com/parse-community/parse-dashboard/commit/01a2a1c773484fef2f847e0c05a8823174782ee2))

# [7.1.0-alpha.4](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.3...7.1.0-alpha.4) (2025-04-06)


### Bug Fixes

* Navigation bar in data browser is transparent and partly covers info panel ([#2717](https://github.com/parse-community/parse-dashboard/issues/2717)) ([60b38a5](https://github.com/parse-community/parse-dashboard/commit/60b38a53e1e288aab2a47d43697fe660fef1fffb))

# [7.1.0-alpha.3](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.2...7.1.0-alpha.3) (2025-04-06)


### Bug Fixes

* Obsolete, long-running data fetch request overrides displayed data of newer fetch request in the data browser ([#2715](https://github.com/parse-community/parse-dashboard/issues/2715)) ([31668eb](https://github.com/parse-community/parse-dashboard/commit/31668ebdbb298b96597243947fd842be9063eed5))

# [7.1.0-alpha.2](https://github.com/parse-community/parse-dashboard/compare/7.1.0-alpha.1...7.1.0-alpha.2) (2025-04-06)


### Features

* Allow row selection in data browser by dragging mouse outside of selection box column ([#2716](https://github.com/parse-community/parse-dashboard/issues/2716)) ([7c0f607](https://github.com/parse-community/parse-dashboard/commit/7c0f607fbb6c704a9793165a9cf14d6a1be792db))

# [7.1.0-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.0.1-alpha.1...7.1.0-alpha.1) (2025-04-06)


### Features

* Add pagination to data browser ([#2659](https://github.com/parse-community/parse-dashboard/issues/2659)) ([a3c8a11](https://github.com/parse-community/parse-dashboard/commit/a3c8a119cb9f669e0e663ec6c018e2b2cf305596))

## [7.0.1-alpha.1](https://github.com/parse-community/parse-dashboard/compare/7.0.0...7.0.1-alpha.1) (2025-04-05)


### Bug Fixes

* Improperly aligned unfolding sub-items in context menu in data browser  ([#2713](https://github.com/parse-community/parse-dashboard/issues/2713)) ([189c817](https://github.com/parse-community/parse-dashboard/commit/189c8170425642fd94a9360e5c001e6687f50c29))

# [7.0.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/7.0.0-alpha.1...7.0.0-alpha.2) (2025-03-27)


### Features

* Allow to select and copy multiple cells in data browser ([#2691](https://github.com/ParsePlatform/parse-dashboard/issues/2691)) ([eb50315](https://github.com/ParsePlatform/parse-dashboard/commit/eb503151b30a5fd35437559eaddfc7e7e5991dc7))

# [7.0.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/6.2.1-alpha.1...7.0.0-alpha.1) (2025-03-22)


### Features

* Increase minimum required Node versions to `18.20.4`, `20.18.0`, `22.12.0` ([#2694](https://github.com/ParsePlatform/parse-dashboard/issues/2694)) ([034df6a](https://github.com/ParsePlatform/parse-dashboard/commit/034df6af3526edc33768f408c9e8faf018fa2ba9))


### BREAKING CHANGES

* Increases the minimum required Node versions to `18.20.4`, `20.18.0`, `22.12.0`. ([034df6a](034df6a))

## [6.2.1-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/6.2.0...6.2.1-alpha.1) (2025-03-19)


### Bug Fixes

* Title row disappears when scrolling down in data browser ([#2690](https://github.com/ParsePlatform/parse-dashboard/issues/2690)) ([7eebc45](https://github.com/ParsePlatform/parse-dashboard/commit/7eebc45a17844e7d72c5a7e86963ee355f63dd77))

# [6.2.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/6.2.0-alpha.2...6.2.0-alpha.3) (2025-03-16)


### Bug Fixes

* Bump @babel/runtime from 7.20.13 to 7.26.10 ([#2677](https://github.com/ParsePlatform/parse-dashboard/issues/2677)) ([37f4ea6](https://github.com/ParsePlatform/parse-dashboard/commit/37f4ea64a39c0f54aaf2e3631fd1f7b6bc03ae96))

# [6.2.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/6.2.0-alpha.1...6.2.0-alpha.2) (2025-03-16)


### Bug Fixes

* Security upgrade node from 20.18.2-alpine3.20 to 20.19.0-alpine3.20 ([#2676](https://github.com/ParsePlatform/parse-dashboard/issues/2676)) ([d251334](https://github.com/ParsePlatform/parse-dashboard/commit/d251334df22fbe46e77076bb583b218be6f1889c))

# [6.2.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/6.1.1-alpha.1...6.2.0-alpha.1) (2025-03-09)


### Features

* Use Enter key to edit cell content in data browser ([#2672](https://github.com/ParsePlatform/parse-dashboard/issues/2672)) ([ac2dc41](https://github.com/ParsePlatform/parse-dashboard/commit/ac2dc41122faedb1fb7da205ba26229a77417da8))

## [6.1.1-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/6.1.0...6.1.1-alpha.1) (2025-03-06)


### Bug Fixes

* Dashboard crashes when setting `unique` filter on pointer field in data browser ([#2660](https://github.com/ParsePlatform/parse-dashboard/issues/2660)) ([68fdbe8](https://github.com/ParsePlatform/parse-dashboard/commit/68fdbe8460d2afafbc922479bfef86e994449a20))

# [6.0.0-alpha.30](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.29...6.0.0-alpha.30) (2025-03-03)


### Features

* Add cell selection in data browser on space bar touch down ([#2661](https://github.com/ParsePlatform/parse-dashboard/issues/2661)) ([9d623a9](https://github.com/ParsePlatform/parse-dashboard/commit/9d623a97a4e9ff9692f72191a33441a22fb6956e))

# [6.0.0-alpha.29](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.28...6.0.0-alpha.29) (2025-02-14)


### Features

* Add dynamic master key by allowing to set option `masterKey` to a function ([#2655](https://github.com/ParsePlatform/parse-dashboard/issues/2655)) ([9025ed0](https://github.com/ParsePlatform/parse-dashboard/commit/9025ed07b5e7fd801a6ec56c71a12299b2d57279))

# [6.0.0-alpha.28](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.27...6.0.0-alpha.28) (2025-02-01)


### Bug Fixes

* Info panel item `panel` calls Cloud Code with parameter `objectId` instead of `Parse.Object` and without `masterKey` ([#2649](https://github.com/ParsePlatform/parse-dashboard/issues/2649)) ([884ff70](https://github.com/ParsePlatform/parse-dashboard/commit/884ff70567e372ff676297b6fb7856fbb7b71cbb))

# [6.0.0-alpha.27](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.26...6.0.0-alpha.27) (2025-02-01)


### Bug Fixes

* Security upgrade node from 20.17.0-alpine3.20 to 20.18.2-alpine3.20 ([#2647](https://github.com/ParsePlatform/parse-dashboard/issues/2647)) ([44df723](https://github.com/ParsePlatform/parse-dashboard/commit/44df723b56636607f44c16f2ca24e81e0e17dfb3))

# [6.0.0-alpha.26](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.25...6.0.0-alpha.26) (2025-01-31)


### Features

* Add info panel `keyValue` item parameter `isRelativeUrl` to link to dashboard pages ([#2646](https://github.com/ParsePlatform/parse-dashboard/issues/2646)) ([6389fc6](https://github.com/ParsePlatform/parse-dashboard/commit/6389fc6097a76dc95e3cbcdab56c8d1f96909d97))

# [6.0.0-alpha.25](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.24...6.0.0-alpha.25) (2025-01-30)


### Features

* Add info panel item `panel` to load and display data on demand ([#2622](https://github.com/ParsePlatform/parse-dashboard/issues/2622)) ([8e5741d](https://github.com/ParsePlatform/parse-dashboard/commit/8e5741d73b5a8c4fcb5d4248de1bdcd7bd957ee8))

# [6.0.0-alpha.24](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.23...6.0.0-alpha.24) (2025-01-29)


### Bug Fixes

* Info panel Cloud Code call sends `objectId` instead of `Parse.Object` ([#2643](https://github.com/ParsePlatform/parse-dashboard/issues/2643)) ([a4bcabc](https://github.com/ParsePlatform/parse-dashboard/commit/a4bcabc5c5eaf07bc9eed11814c19901e1d310da))

# [6.0.0-alpha.23](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.22...6.0.0-alpha.23) (2025-01-29)


### Bug Fixes

* Info panel Cloud Code call is unauthenticated without using master key ([#2641](https://github.com/ParsePlatform/parse-dashboard/issues/2641)) ([e879e4f](https://github.com/ParsePlatform/parse-dashboard/commit/e879e4f541dc0aa3e23afe6606ee7df9ba22b63a))

# [6.0.0-alpha.22](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.21...6.0.0-alpha.22) (2025-01-29)


### Bug Fixes

* Info panel not configurable via `new ParseDashboard()` when running as express middleware ([#2639](https://github.com/ParsePlatform/parse-dashboard/issues/2639)) ([a9b8cd4](https://github.com/ParsePlatform/parse-dashboard/commit/a9b8cd4a7228837cbb462a45e39b01494852f347))

# [6.0.0-alpha.21](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.20...6.0.0-alpha.21) (2025-01-24)


### Bug Fixes

* Info panel not showing when some apps miss infoPanel config ([#2627](https://github.com/ParsePlatform/parse-dashboard/issues/2627)) ([539e883](https://github.com/ParsePlatform/parse-dashboard/commit/539e88348721bc100a80ae00de81a921bc2c53d4))

# [6.0.0-alpha.20](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.19...6.0.0-alpha.20) (2024-11-19)


### Bug Fixes

* Security upgrade cross-spawn from 7.0.3 to 7.0.6 ([#2629](https://github.com/ParsePlatform/parse-dashboard/issues/2629)) ([47a43e0](https://github.com/ParsePlatform/parse-dashboard/commit/47a43e0ac5d55fc9e214079895f71af7c7e3c350))

# [6.0.0-alpha.19](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.18...6.0.0-alpha.19) (2024-10-16)


### Bug Fixes

* Security upgrade ws, parse and puppeteer ([#2618](https://github.com/ParsePlatform/parse-dashboard/issues/2618)) ([bab71dc](https://github.com/ParsePlatform/parse-dashboard/commit/bab71dc57195efa62518127de842edd5902603de))

# [6.0.0-alpha.18](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.17...6.0.0-alpha.18) (2024-10-16)


### Bug Fixes

* Node 22 support missing in package.json ([#2617](https://github.com/ParsePlatform/parse-dashboard/issues/2617)) ([8c07284](https://github.com/ParsePlatform/parse-dashboard/commit/8c07284cd571c69426c3f080c2698b0624fd4ec4))

# [6.0.0-alpha.17](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.16...6.0.0-alpha.17) (2024-10-09)


### Bug Fixes

* Security upgrade express from 4.21.0 to 4.21.1 ([#2607](https://github.com/ParsePlatform/parse-dashboard/issues/2607)) ([54bf0af](https://github.com/ParsePlatform/parse-dashboard/commit/54bf0afa0691e448b7ec20395753468e047e1fd1))

# [6.0.0-alpha.16](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.15...6.0.0-alpha.16) (2024-10-07)


### Bug Fixes

* Dashboard not building for Docker platform arm64/v8 ([#2534](https://github.com/ParsePlatform/parse-dashboard/issues/2534)) ([8c4a862](https://github.com/ParsePlatform/parse-dashboard/commit/8c4a862d63b8e568738a2eeab25b6e977cd1ee11))

# [6.0.0-alpha.15](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.14...6.0.0-alpha.15) (2024-10-07)


### Features

* Add support for Node 22 ([#2603](https://github.com/ParsePlatform/parse-dashboard/issues/2603)) ([3689106](https://github.com/ParsePlatform/parse-dashboard/commit/3689106b4089aebe73ddb8668863dc82fd267b5c))

# [6.0.0-alpha.14](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.13...6.0.0-alpha.14) (2024-10-06)


### Features

* Add data panel to display object related data fetched via Cloud Function ([#2584](https://github.com/ParsePlatform/parse-dashboard/issues/2584)) ([914cc71](https://github.com/ParsePlatform/parse-dashboard/commit/914cc71790157289c32b95cd9d4cdf3d0685989f))

# [6.0.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.12...6.0.0-alpha.13) (2024-09-25)


### Bug Fixes

* Internal classes `_User`, `_Role`, `_Installation` referenced with pointer don't appear in data browser filter dialog ([#2599](https://github.com/ParsePlatform/parse-dashboard/issues/2599)) ([8239cc8](https://github.com/ParsePlatform/parse-dashboard/commit/8239cc8a05865c5f0b4f5b33dfb224e87d25a319))

# [6.0.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.11...6.0.0-alpha.12) (2024-08-07)


### Bug Fixes

* Filter string is erased when changing filter condition ([#2586](https://github.com/ParsePlatform/parse-dashboard/issues/2586)) ([6fa2c8c](https://github.com/ParsePlatform/parse-dashboard/commit/6fa2c8c79201b9ea34321277ab085fa0ba988d77))

# [6.0.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.10...6.0.0-alpha.11) (2024-07-26)


### Bug Fixes

* Descriptive statistics for number cells in data browser not showing ([#2581](https://github.com/ParsePlatform/parse-dashboard/issues/2581)) ([e146b6f](https://github.com/ParsePlatform/parse-dashboard/commit/e146b6f54c7dfcb50c83c70f0c55e5ab76dc3c19))

# [6.0.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.9...6.0.0-alpha.10) (2024-07-11)


### Bug Fixes

* Crash after setting filter using context menu and opening filters panel ([#2579](https://github.com/ParsePlatform/parse-dashboard/issues/2579)) ([5a690eb](https://github.com/ParsePlatform/parse-dashboard/commit/5a690ebe91007698fe1a60334112deed5ce94be1))

# [6.0.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.8...6.0.0-alpha.9) (2024-07-06)


### Features

* Add relational filter conditions in data browser ([#2576](https://github.com/ParsePlatform/parse-dashboard/issues/2576)) ([aa5c68d](https://github.com/ParsePlatform/parse-dashboard/commit/aa5c68dbca458069d93351edc0bc0287fe63b7e1))

# [6.0.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.7...6.0.0-alpha.8) (2024-06-27)


### Features

* Add optional restriction of script execution to certain object fields and values ([#2488](https://github.com/ParsePlatform/parse-dashboard/issues/2488)) ([8feac9b](https://github.com/ParsePlatform/parse-dashboard/commit/8feac9b8359f27ecd7bd4342be7bcae75289ba35))

# [6.0.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.6...6.0.0-alpha.7) (2024-05-19)


### Features

* Add Cloud Config change history to roll back to previous values ([#2554](https://github.com/ParsePlatform/parse-dashboard/issues/2554)) ([a784129](https://github.com/ParsePlatform/parse-dashboard/commit/a784129dd5f25d6464cdd5d768e296fda4501b42))

# [6.0.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.5...6.0.0-alpha.6) (2024-05-15)


### Features

* Add filter `starts with` in data browser for fields of type Pointer ([#2553](https://github.com/ParsePlatform/parse-dashboard/issues/2553)) ([0b94ab6](https://github.com/ParsePlatform/parse-dashboard/commit/0b94ab6ced8b338cd3539f8cad37feb4452e1bcc))

# [6.0.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.4...6.0.0-alpha.5) (2024-05-15)


### Bug Fixes

* Deleting all code in the JS Console editor fills in the default code ([#2558](https://github.com/ParsePlatform/parse-dashboard/issues/2558)) ([4b830ba](https://github.com/ParsePlatform/parse-dashboard/commit/4b830bac8dc6549555eca50e999a3283aff100c7))

# [6.0.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.3...6.0.0-alpha.4) (2024-05-15)


### Bug Fixes

* Dashboard scrolls when selecting row in data browser ([#2559](https://github.com/ParsePlatform/parse-dashboard/issues/2559)) ([2aa54a5](https://github.com/ParsePlatform/parse-dashboard/commit/2aa54a5bb1f356a7d4ed5abf3ea42c2e406d5b5a))

# [6.0.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.2...6.0.0-alpha.3) (2024-04-30)


### Features

* Select rows in data browser by clicking and dragging mouse cursor over checkboxes ([#2548](https://github.com/ParsePlatform/parse-dashboard/issues/2548)) ([792ba9e](https://github.com/ParsePlatform/parse-dashboard/commit/792ba9e619224c6101ed21cd36add9fe83c3e348))

# [6.0.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/6.0.0-alpha.1...6.0.0-alpha.2) (2024-04-30)


### Bug Fixes

* Class Level Permissions dialog throws error `TypeError: ce.current is null` for newly created class ([#2549](https://github.com/ParsePlatform/parse-dashboard/issues/2549)) ([27ed692](https://github.com/ParsePlatform/parse-dashboard/commit/27ed6920d38bfe6476aaf2cebd4124dc30389959))

# [6.0.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.8...6.0.0-alpha.1) (2024-03-05)


### Features

* Add Node 20 support; remove Node 14, 16 support ([#2532](https://github.com/ParsePlatform/parse-dashboard/issues/2532)) ([578a339](https://github.com/ParsePlatform/parse-dashboard/commit/578a339c04990b5ecb3f80d34c690c6d34218bfa))
* Add Node 20 support; remove Node 14, 16 support ([#2535](https://github.com/ParsePlatform/parse-dashboard/issues/2535)) ([5c90f2d](https://github.com/ParsePlatform/parse-dashboard/commit/5c90f2de1b98a2099453c8f8c0d6817330f7133d))


### BREAKING CHANGES

* Removes support for Node 14 and 16 ([5c90f2d](5c90f2d))

# [5.4.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.7...5.4.0-alpha.8) (2024-02-29)


### Bug Fixes

* Config page fails to load ([#2531](https://github.com/ParsePlatform/parse-dashboard/issues/2531)) ([d721b7c](https://github.com/ParsePlatform/parse-dashboard/commit/d721b7c4f3b98df96a229e60529604b038857d53))

# [5.4.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.6...5.4.0-alpha.7) (2024-02-26)


### Features

* Add descriptive statistics for number cells in data browser ([#2529](https://github.com/ParsePlatform/parse-dashboard/issues/2529)) ([ead9ec4](https://github.com/ParsePlatform/parse-dashboard/commit/ead9ec4d39abc211540bc76616498533b31001a6))

# [5.4.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.5...5.4.0-alpha.6) (2024-02-26)


### Bug Fixes

* App metrics for user and installation counts show dash ([#2528](https://github.com/ParsePlatform/parse-dashboard/issues/2528)) ([850d7b3](https://github.com/ParsePlatform/parse-dashboard/commit/850d7b3f20160761a21f68ec398d7207b8226770))

# [5.4.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.4...5.4.0-alpha.5) (2024-02-18)


### Bug Fixes

* Open pointer in new tab in data browser not working when mount path is not root ([#2527](https://github.com/ParsePlatform/parse-dashboard/issues/2527)) ([2f4081f](https://github.com/ParsePlatform/parse-dashboard/commit/2f4081f217e1c5d906ed8789e09a3377ddc15121))

# [5.4.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.3...5.4.0-alpha.4) (2024-02-15)


### Bug Fixes

* Data browser redirects to wrong class when changing app ([#2526](https://github.com/ParsePlatform/parse-dashboard/issues/2526)) ([7713f54](https://github.com/ParsePlatform/parse-dashboard/commit/7713f542ef9ef97cbf784fa267f7ea2a51c9472a))

# [5.4.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.2...5.4.0-alpha.3) (2023-12-16)


### Bug Fixes

* Dashboard crashes if Parse Server Cloud Function script returns object ([#2516](https://github.com/ParsePlatform/parse-dashboard/issues/2516)) ([5de08f8](https://github.com/ParsePlatform/parse-dashboard/commit/5de08f8f4d67f287a589c70d8b8d36f9f76897cf))

# [5.4.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.4.0-alpha.1...5.4.0-alpha.2) (2023-12-16)


### Features

* Execute script for selected rows ([#2508](https://github.com/ParsePlatform/parse-dashboard/issues/2508)) ([5d9901e](https://github.com/ParsePlatform/parse-dashboard/commit/5d9901e27b14517f22993ac094bdd7d8fbac401f))

# [5.4.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.3.0...5.4.0-alpha.1) (2023-12-02)


### Features

* Add refresh indicator to Cloud Config page ([#2505](https://github.com/ParsePlatform/parse-dashboard/issues/2505)) ([a10d1f0](https://github.com/ParsePlatform/parse-dashboard/commit/a10d1f0825688d403206ce7cbacada191dbf5c3b))

# [5.3.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.3.0-alpha.1...5.3.0-alpha.2) (2023-10-18)


### Features

* Add refresh indicator to Cloud Config page ([#2505](https://github.com/ParsePlatform/parse-dashboard/issues/2505)) ([a10d1f0](https://github.com/ParsePlatform/parse-dashboard/commit/a10d1f0825688d403206ce7cbacada191dbf5c3b))

# [5.3.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0...5.3.0-alpha.1) (2023-09-20)


### Bug Fixes

* Adding a file when adding a new row in the data browser doesn't show filename ([#2471](https://github.com/ParsePlatform/parse-dashboard/issues/2471)) ([5bbb94e](https://github.com/ParsePlatform/parse-dashboard/commit/5bbb94e5b5266af5ed770d0241605eb859699831))
* File extension is hidden in file field when editing object in modal dialog in data browser ([#2472](https://github.com/ParsePlatform/parse-dashboard/issues/2472)) ([8df4e4d](https://github.com/ParsePlatform/parse-dashboard/commit/8df4e4d9abf2ef9e487a48b209f33bedc03b55a3))
* Incorrect highlight maker position in class list in data browser ([#2490](https://github.com/ParsePlatform/parse-dashboard/issues/2490)) ([8c28d24](https://github.com/ParsePlatform/parse-dashboard/commit/8c28d245cfe5d9558ffd276b9660f73449c4f35a))
* Pasting location coordinates into field of type `GeoPoint` does not work in data browser ([#2464](https://github.com/ParsePlatform/parse-dashboard/issues/2464)) ([a8ce343](https://github.com/ParsePlatform/parse-dashboard/commit/a8ce3436a4ffe76ccf892965fa21dc2a467e2d14))
* Selecting a saved filter in data browser also highlights other filters with equal names ([#2466](https://github.com/ParsePlatform/parse-dashboard/issues/2466)) ([35360fe](https://github.com/ParsePlatform/parse-dashboard/commit/35360fec68edbca619075227960062859bb9db2e))
* Vertical scrollbar in data browser is outside visible area when scrolling horizontally ([#2457](https://github.com/ParsePlatform/parse-dashboard/issues/2457)) ([5acac3f](https://github.com/ParsePlatform/parse-dashboard/commit/5acac3fb5c74cbb24ec96b721d874fbc36096c39))

### Features

* Add Cloud Function execution on Parse Object in data browser ([#2409](https://github.com/ParsePlatform/parse-dashboard/issues/2409)) ([996ce91](https://github.com/ParsePlatform/parse-dashboard/commit/996ce916bfedb92c36deede4c234dde8c0554cbb))
* Add parameter `selectedField` to script payload to determine which object field was selected when script was invoked ([#2483](https://github.com/ParsePlatform/parse-dashboard/issues/2483)) ([e98d653](https://github.com/ParsePlatform/parse-dashboard/commit/e98d653b96787720dad5310c5af98869e2ac2923))
* Add refresh button to Cloud Config page ([#2480](https://github.com/ParsePlatform/parse-dashboard/issues/2480)) ([be212b0](https://github.com/ParsePlatform/parse-dashboard/commit/be212b0ad6c777f7c5ee9a74cac0affa63faa1c1))
* Add security checks page ([#2491](https://github.com/ParsePlatform/parse-dashboard/issues/2491)) ([103b9c6](https://github.com/ParsePlatform/parse-dashboard/commit/103b9c61d152487898062485b40f11ecdac3d2e7))
* Add support for confirmation dialog before script execution in data browser ([#2481](https://github.com/ParsePlatform/parse-dashboard/issues/2481)) ([64d3913](https://github.com/ParsePlatform/parse-dashboard/commit/64d391320bbdb519af8ff93fe8579315ef48e36e))
* Add typing with auto-complete to select a filter field in the data browser ([#2463](https://github.com/ParsePlatform/parse-dashboard/issues/2463)) ([257f76b](https://github.com/ParsePlatform/parse-dashboard/commit/257f76bbf8d1e880e3b7b704edee2eebf76451c8))
* Reopen last opened class when navigating to data browser ([#2468](https://github.com/ParsePlatform/parse-dashboard/issues/2468)) ([3d7148e](https://github.com/ParsePlatform/parse-dashboard/commit/3d7148e75a6e9eaeeb7cbb546885b5916f6025bb))

### Reverts

* fix: Vertical scrollbar in data browser is outside visible area when scrolling horizontally ([#2457](https://github.com/ParsePlatform/parse-dashboard/issues/2457)) ([#2477](https://github.com/ParsePlatform/parse-dashboard/issues/2477)) ([2f1d84e](https://github.com/ParsePlatform/parse-dashboard/commit/2f1d84e41c24507b516b933037807f1061182991))

# [5.2.0-alpha.28](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.27...5.2.0-alpha.28) (2023-08-27)


### Features

* Add security checks page ([#2491](https://github.com/ParsePlatform/parse-dashboard/issues/2491)) ([103b9c6](https://github.com/ParsePlatform/parse-dashboard/commit/103b9c61d152487898062485b40f11ecdac3d2e7))

# [5.2.0-alpha.27](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.26...5.2.0-alpha.27) (2023-06-30)


### Bug Fixes

* Adding a file when adding a new row in the data browser doesn't show filename ([#2471](https://github.com/ParsePlatform/parse-dashboard/issues/2471)) ([5bbb94e](https://github.com/ParsePlatform/parse-dashboard/commit/5bbb94e5b5266af5ed770d0241605eb859699831))

# [5.2.0-alpha.26](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.25...5.2.0-alpha.26) (2023-06-30)


### Bug Fixes

* File extension is hidden in file field when editing object in modal dialog in data browser ([#2472](https://github.com/ParsePlatform/parse-dashboard/issues/2472)) ([8df4e4d](https://github.com/ParsePlatform/parse-dashboard/commit/8df4e4d9abf2ef9e487a48b209f33bedc03b55a3))

# [5.2.0-alpha.25](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.24...5.2.0-alpha.25) (2023-06-29)


### Bug Fixes

* Incorrect highlight maker position in class list in data browser ([#2490](https://github.com/ParsePlatform/parse-dashboard/issues/2490)) ([8c28d24](https://github.com/ParsePlatform/parse-dashboard/commit/8c28d245cfe5d9558ffd276b9660f73449c4f35a))

# [5.2.0-alpha.24](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.23...5.2.0-alpha.24) (2023-06-28)


### Features

* Add support for confirmation dialog before script execution in data browser ([#2481](https://github.com/ParsePlatform/parse-dashboard/issues/2481)) ([64d3913](https://github.com/ParsePlatform/parse-dashboard/commit/64d391320bbdb519af8ff93fe8579315ef48e36e))

# [5.2.0-alpha.23](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.22...5.2.0-alpha.23) (2023-06-28)


### Features

* Add parameter `selectedField` to script payload to determine which object field was selected when script was invoked ([#2483](https://github.com/ParsePlatform/parse-dashboard/issues/2483)) ([e98d653](https://github.com/ParsePlatform/parse-dashboard/commit/e98d653b96787720dad5310c5af98869e2ac2923))

# [5.2.0-alpha.22](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.21...5.2.0-alpha.22) (2023-06-27)


### Features

* Add refresh button to Cloud Config page ([#2480](https://github.com/ParsePlatform/parse-dashboard/issues/2480)) ([be212b0](https://github.com/ParsePlatform/parse-dashboard/commit/be212b0ad6c777f7c5ee9a74cac0affa63faa1c1))

# [5.2.0-alpha.21](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.20...5.2.0-alpha.21) (2023-06-24)


### Reverts

* fix: Vertical scrollbar in data browser is outside visible area when scrolling horizontally ([#2457](https://github.com/ParsePlatform/parse-dashboard/issues/2457)) ([#2477](https://github.com/ParsePlatform/parse-dashboard/issues/2477)) ([2f1d84e](https://github.com/ParsePlatform/parse-dashboard/commit/2f1d84e41c24507b516b933037807f1061182991))

# [5.2.0-alpha.20](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.19...5.2.0-alpha.20) (2023-06-23)


### Bug Fixes

* Selecting a saved filter in data browser also highlights other filters with equal names ([#2466](https://github.com/ParsePlatform/parse-dashboard/issues/2466)) ([35360fe](https://github.com/ParsePlatform/parse-dashboard/commit/35360fec68edbca619075227960062859bb9db2e))

# [5.2.0-alpha.19](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.18...5.2.0-alpha.19) (2023-06-23)


### Features

* Add Cloud Function execution on Parse Object in data browser ([#2409](https://github.com/ParsePlatform/parse-dashboard/issues/2409)) ([996ce91](https://github.com/ParsePlatform/parse-dashboard/commit/996ce916bfedb92c36deede4c234dde8c0554cbb))

# [5.2.0-alpha.18](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.17...5.2.0-alpha.18) (2023-06-20)


### Bug Fixes

* Pasting location coordinates into field of type `GeoPoint` does not work in data browser ([#2464](https://github.com/ParsePlatform/parse-dashboard/issues/2464)) ([a8ce343](https://github.com/ParsePlatform/parse-dashboard/commit/a8ce3436a4ffe76ccf892965fa21dc2a467e2d14))

# [5.2.0-alpha.17](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.16...5.2.0-alpha.17) (2023-06-19)


### Features

* Add typing with auto-complete to select a filter field in the data browser ([#2463](https://github.com/ParsePlatform/parse-dashboard/issues/2463)) ([257f76b](https://github.com/ParsePlatform/parse-dashboard/commit/257f76bbf8d1e880e3b7b704edee2eebf76451c8))

# [5.2.0-alpha.16](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.15...5.2.0-alpha.16) (2023-06-19)


### Features

* Reopen last opened class when navigating to data browser ([#2468](https://github.com/ParsePlatform/parse-dashboard/issues/2468)) ([3d7148e](https://github.com/ParsePlatform/parse-dashboard/commit/3d7148e75a6e9eaeeb7cbb546885b5916f6025bb))

# [5.2.0-alpha.15](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.14...5.2.0-alpha.15) (2023-06-11)


### Bug Fixes

* Vertical scrollbar in data browser is outside visible area when scrolling horizontally ([#2457](https://github.com/ParsePlatform/parse-dashboard/issues/2457)) ([5acac3f](https://github.com/ParsePlatform/parse-dashboard/commit/5acac3fb5c74cbb24ec96b721d874fbc36096c39))

# [5.2.0-alpha.14](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.13...5.2.0-alpha.14) (2023-06-10)


### Bug Fixes

* Hitting backspace key in data browser crashes dashboard ([#2456](https://github.com/ParsePlatform/parse-dashboard/issues/2456)) ([32aeea2](https://github.com/ParsePlatform/parse-dashboard/commit/32aeea244d81404579f55adf25244c11e3a797d1))

# [5.2.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.12...5.2.0-alpha.13) (2023-06-10)


### Features

* Add export of saved data browser filters via `classPreference` settings ([#2455](https://github.com/ParsePlatform/parse-dashboard/issues/2455)) ([f56f946](https://github.com/ParsePlatform/parse-dashboard/commit/f56f946023c628c96030e9d2d66284c53decd33e))

# [5.2.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.11...5.2.0-alpha.12) (2023-06-09)


### Features

* Add filter views to save frequently used filters in data browser ([#2404](https://github.com/ParsePlatform/parse-dashboard/issues/2404)) ([a9ec3a9](https://github.com/ParsePlatform/parse-dashboard/commit/a9ec3a915ff354304f382c17e8d5311b2c96d7ff))

# [5.2.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.10...5.2.0-alpha.11) (2023-06-08)


### Bug Fixes

* Scroll position is preserved when re-opening the same class in data browser via navigation bar ([#2445](https://github.com/ParsePlatform/parse-dashboard/issues/2445)) ([667675c](https://github.com/ParsePlatform/parse-dashboard/commit/667675c031b0483be210a88da3b159f5f815d6fb))

# [5.2.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.9...5.2.0-alpha.10) (2023-06-01)


### Bug Fixes

* Option missing for Parse Config parameter to require master key ([#2440](https://github.com/ParsePlatform/parse-dashboard/issues/2440)) ([6623369](https://github.com/ParsePlatform/parse-dashboard/commit/66233698b333422f306dc7024949aef2ea028f34))

# [5.2.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.8...5.2.0-alpha.9) (2023-05-27)


### Bug Fixes

* Dashboard crashes when adding a row with modal in a class that contains a pointer to another class that contains an array of pointers ([#2416](https://github.com/ParsePlatform/parse-dashboard/issues/2416)) ([286269f](https://github.com/ParsePlatform/parse-dashboard/commit/286269f3e2c4e1c83b14003ce72caaf1f39b16c1))

# [5.2.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.7...5.2.0-alpha.8) (2023-05-27)


### Bug Fixes

* Cannot navigate to nested relation field in data browser ([#2420](https://github.com/ParsePlatform/parse-dashboard/issues/2420)) ([e7ace9e](https://github.com/ParsePlatform/parse-dashboard/commit/e7ace9efa068b92c5cf0e5ccdad169ac7d71e81a))

# [5.2.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.6...5.2.0-alpha.7) (2023-05-27)


### Bug Fixes

* File uploading status not updating in data browser ([#2422](https://github.com/ParsePlatform/parse-dashboard/issues/2422)) ([e761f97](https://github.com/ParsePlatform/parse-dashboard/commit/e761f9715a8366466c6620994ce698adbbfc48cd))

# [5.2.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.5...5.2.0-alpha.6) (2023-05-27)


### Bug Fixes

* Text input cursor jumps to first position when writing long text ([#2413](https://github.com/ParsePlatform/parse-dashboard/issues/2413)) ([422ffb2](https://github.com/ParsePlatform/parse-dashboard/commit/422ffb2897bb2664eb47b5aaad5094a8b39431bf))

# [5.2.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.4...5.2.0-alpha.5) (2023-05-27)


### Bug Fixes

* Back button in data browser disappears after page refresh ([#2421](https://github.com/ParsePlatform/parse-dashboard/issues/2421)) ([6c5f19f](https://github.com/ParsePlatform/parse-dashboard/commit/6c5f19f6ed2cda1f1f0dc59bdaed3ae49f264380))

# [5.2.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.3...5.2.0-alpha.4) (2023-05-27)


### Bug Fixes

* Incorrect date picker position in data browser filter dialog ([#2425](https://github.com/ParsePlatform/parse-dashboard/issues/2425)) ([b96b48f](https://github.com/ParsePlatform/parse-dashboard/commit/b96b48fdd5ce452783e0887c36231971a1822173))

# [5.2.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.2...5.2.0-alpha.3) (2023-05-27)


### Bug Fixes

* Empty table in data browser when navigating back using the "back” button ([#2423](https://github.com/ParsePlatform/parse-dashboard/issues/2423)) ([6f3dab6](https://github.com/ParsePlatform/parse-dashboard/commit/6f3dab60c257c76345235acfd3e43aafadeb84c8))

# [5.2.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.2.0-alpha.1...5.2.0-alpha.2) (2023-05-27)


### Features

* Add links to users and roles in ACL dialog and handle invalid entries ([#2436](https://github.com/ParsePlatform/parse-dashboard/issues/2436)) ([a20cb8e](https://github.com/ParsePlatform/parse-dashboard/commit/a20cb8e534d3fecd8d337463864b15048772a9a5))

# [5.2.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0...5.2.0-alpha.1) (2023-05-21)


### Bug Fixes

* Uncaught error when editing Number field in Edit Row dialog ([#2401](https://github.com/ParsePlatform/parse-dashboard/issues/2401)) ([26bd6fa](https://github.com/ParsePlatform/parse-dashboard/commit/26bd6fa39be1076621856a9c86dcd1307f8f7fdd))

### Features

* Add visual configurator for Parse Dashboard settings ([#2406](https://github.com/ParsePlatform/parse-dashboard/issues/2406)) ([228d839](https://github.com/ParsePlatform/parse-dashboard/commit/228d83903fd8698da7b96a5b74699f3ff2d5dad4))
* Data types and pointer classes are sorted alphabetically in dialog to add new column ([#2400](https://github.com/ParsePlatform/parse-dashboard/issues/2400)) ([d9d285b](https://github.com/ParsePlatform/parse-dashboard/commit/d9d285b7f90434d3bb138c2c765272498e3f09c3))
* Sort Cloud Code Jobs alphabetically ([#2402](https://github.com/ParsePlatform/parse-dashboard/issues/2402)) ([77fc372](https://github.com/ParsePlatform/parse-dashboard/commit/77fc372bedb9fb4eca728c1bc076e823c5bc3a2c))

# [5.1.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.12...5.1.0-alpha.13) (2023-03-07)


### Features

* Sort Cloud Code Jobs alphabetically ([#2402](https://github.com/ParsePlatform/parse-dashboard/issues/2402)) ([77fc372](https://github.com/ParsePlatform/parse-dashboard/commit/77fc372bedb9fb4eca728c1bc076e823c5bc3a2c))

# [5.1.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.11...5.1.0-alpha.12) (2023-03-05)


### Bug Fixes

* Uncaught error when editing Number field in Edit Row dialog ([#2401](https://github.com/ParsePlatform/parse-dashboard/issues/2401)) ([26bd6fa](https://github.com/ParsePlatform/parse-dashboard/commit/26bd6fa39be1076621856a9c86dcd1307f8f7fdd))

# [5.1.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.10...5.1.0-alpha.11) (2023-03-05)


### Features

* Data types and pointer classes are sorted alphabetically in dialog to add new column ([#2400](https://github.com/ParsePlatform/parse-dashboard/issues/2400)) ([d9d285b](https://github.com/ParsePlatform/parse-dashboard/commit/d9d285b7f90434d3bb138c2c765272498e3f09c3))

# [5.1.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.9...5.1.0-alpha.10) (2023-02-13)


### Bug Fixes

* Data browser dialog "No data to display" may be outside of visible area in Safari browser ([#2387](https://github.com/ParsePlatform/parse-dashboard/issues/2387)) ([52bba62](https://github.com/ParsePlatform/parse-dashboard/commit/52bba6246cd05c255ca562dcb32da5b104f9908e))

# [5.1.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.8...5.1.0-alpha.9) (2023-02-11)


### Bug Fixes

* Screen goes blank when trying to add column of type `Object` or `GeoPoint` ([#2384](https://github.com/ParsePlatform/parse-dashboard/issues/2384)) ([0886386](https://github.com/ParsePlatform/parse-dashboard/commit/08863868b90455116232b2b73a39391ba990c30c))

# [5.1.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.7...5.1.0-alpha.8) (2023-01-29)


### Bug Fixes

* Internal error message on login with missing credential ([#2370](https://github.com/ParsePlatform/parse-dashboard/issues/2370)) ([9a6a31f](https://github.com/ParsePlatform/parse-dashboard/commit/9a6a31f7d45d1402bfc3a988bef21c4a5bb1b123))

# [5.1.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.6...5.1.0-alpha.7) (2023-01-28)


### Bug Fixes

* Dashboard may display blank page when selecting an app after login ([#2375](https://github.com/ParsePlatform/parse-dashboard/issues/2375)) ([f399b91](https://github.com/ParsePlatform/parse-dashboard/commit/f399b913490f15a0d3be8dde7242dd0b825fa02e))

# [5.1.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.5...5.1.0-alpha.6) (2023-01-25)


### Bug Fixes

* Navigation to page fails if user re-login is required ([#2369](https://github.com/ParsePlatform/parse-dashboard/issues/2369)) ([0db6f55](https://github.com/ParsePlatform/parse-dashboard/commit/0db6f5559f9b7bb1f5a282c6182810ca89945032))

# [5.1.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.4...5.1.0-alpha.5) (2023-01-25)


### Features

* Add export all rows of a class and export in JSON format ([#2361](https://github.com/ParsePlatform/parse-dashboard/issues/2361)) ([9eb36a1](https://github.com/ParsePlatform/parse-dashboard/commit/9eb36a183b8b337960f6e8563ad686958001a22b))

# [5.1.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.3...5.1.0-alpha.4) (2023-01-25)


### Bug Fixes

* Add dashboard option `cookieSessionMaxAge` to keep user logged in across browser sessions ([#2366](https://github.com/ParsePlatform/parse-dashboard/issues/2366)) ([9ea95fc](https://github.com/ParsePlatform/parse-dashboard/commit/9ea95fc62103b52cf4fac1d1b567334b5298b318))

# [5.1.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.2...5.1.0-alpha.3) (2023-01-20)


### Features

* Add schema export ([#2362](https://github.com/ParsePlatform/parse-dashboard/issues/2362)) ([33df049](https://github.com/ParsePlatform/parse-dashboard/commit/33df0495a02c4e77f48b3566032bf5686227cce7))

# [5.1.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.1.0-alpha.1...5.1.0-alpha.2) (2023-01-20)


### Bug Fixes

* Blank screen shown if server is unreachable; unsupported pages are accessible via direct URLs ([#2363](https://github.com/ParsePlatform/parse-dashboard/issues/2363)) ([9855258](https://github.com/ParsePlatform/parse-dashboard/commit/98552584df4d8d75d65d3e394b4acad522117a96))

# [5.1.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0...5.1.0-alpha.1) (2022-11-05)


### Bug Fixes

* Text selection not visible in modal dialog header ([#2340](https://github.com/ParsePlatform/parse-dashboard/issues/2340)) ([fb0e79c](https://github.com/ParsePlatform/parse-dashboard/commit/fb0e79c0837c3acce27524e798e02da667cbc5a3))

### Features

* remove limitation to refresh Cloud Jobs list only after 30 seconds ([#2332](https://github.com/ParsePlatform/parse-dashboard/issues/2332)) ([ad1132f](https://github.com/ParsePlatform/parse-dashboard/commit/ad1132fb13e854a030e769fdf7689f35d363031d))

# [5.0.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.7...5.0.0-alpha.8) (2022-10-24)


### Bug Fixes

* login fails with error `req.session.regenerate is not a function` ([#2196](https://github.com/ParsePlatform/parse-dashboard/issues/2196)) ([a71848c](https://github.com/ParsePlatform/parse-dashboard/commit/a71848ce44fa19e579f9731bab50a7244ab89b11))

### Features

* remove limitation to refresh Cloud Jobs list only after 30 seconds ([#2332](https://github.com/ParsePlatform/parse-dashboard/issues/2332)) ([ad1132f](https://github.com/ParsePlatform/parse-dashboard/commit/ad1132fb13e854a030e769fdf7689f35d363031d))

# [5.0.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.6...5.0.0-alpha.7) (2022-10-17)


### Bug Fixes

* using browser navigation backward / forward button clears data browser ([#2317](https://github.com/ParsePlatform/parse-dashboard/issues/2317)) ([7d9b957](https://github.com/ParsePlatform/parse-dashboard/commit/7d9b9575184d7b03fac0e74fa785409af399d314))

# [5.0.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.5...5.0.0-alpha.6) (2022-10-15)


### Bug Fixes

* raw value of read-only date field in data browser cannot be copied ([#2326](https://github.com/ParsePlatform/parse-dashboard/issues/2326)) ([4af7b98](https://github.com/ParsePlatform/parse-dashboard/commit/4af7b981ec1c8356c33215a49f3757a4005525a1))

# [5.0.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.4...5.0.0-alpha.5) (2022-10-15)


### Features

* improve distinction between deletion confirmation dialogs ([#2319](https://github.com/ParsePlatform/parse-dashboard/issues/2319)) ([23c12ff](https://github.com/ParsePlatform/parse-dashboard/commit/23c12ffbd49508de5c6e5e6155e6720e9f960fc5))

# [5.0.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.3...5.0.0-alpha.4) (2022-10-09)


### Features

* keep entered filter value when changing filter operator ([#2313](https://github.com/ParsePlatform/parse-dashboard/issues/2313)) ([d6d38bf](https://github.com/ParsePlatform/parse-dashboard/commit/d6d38bfc2b06360c6a1ecc990f937cd675d1ff39))

# [5.0.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.2...5.0.0-alpha.3) (2022-09-27)


### Bug Fixes

* minor UI layout issues ([#2270](https://github.com/ParsePlatform/parse-dashboard/issues/2270)) ([51d083b](https://github.com/ParsePlatform/parse-dashboard/commit/51d083b218d1291fc27ee2a5f1727c5f2a1dc7d4))

# [5.0.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/5.0.0-alpha.1...5.0.0-alpha.2) (2022-09-27)


### Bug Fixes

* increase required Node engine version to `>=14.20.1` ([#2281](https://github.com/ParsePlatform/parse-dashboard/issues/2281)) ([50de52b](https://github.com/ParsePlatform/parse-dashboard/commit/50de52b6dddad079224e3c3b21ed16f4df347a33))

# [5.0.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.17...5.0.0-alpha.1) (2022-09-27)


### Features

* remove Node 12 support ([#2277](https://github.com/ParsePlatform/parse-dashboard/issues/2277)) ([18b0e76](https://github.com/ParsePlatform/parse-dashboard/commit/18b0e76e28938f4cb3eaaed7ba3292fc622a35c7))


### BREAKING CHANGES

* This version removes support for Node 12; the new minimum required Node version is 14. ([18b0e76](18b0e76))

# [4.2.0-alpha.17](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.16...4.2.0-alpha.17) (2022-09-21)


### Bug Fixes

* view relation dialog requires browser refresh when navigating ([#2275](https://github.com/ParsePlatform/parse-dashboard/issues/2275)) ([d60a8b7](https://github.com/ParsePlatform/parse-dashboard/commit/d60a8b7c1ab6c4c8dd85051d9c1acb05a0a69a59))

# [4.2.0-alpha.16](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.15...4.2.0-alpha.16) (2022-09-21)


### Bug Fixes

* file upload dialog in data browser shows multiple times ([#2276](https://github.com/ParsePlatform/parse-dashboard/issues/2276)) ([3927340](https://github.com/ParsePlatform/parse-dashboard/commit/39273403568f7ca13a349cac53fbb6a99d8823cc))

# [4.2.0-alpha.15](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.14...4.2.0-alpha.15) (2022-09-19)


### Bug Fixes

* context menu in data browser is not scrollable ([#2271](https://github.com/ParsePlatform/parse-dashboard/issues/2271)) ([6c54bd8](https://github.com/ParsePlatform/parse-dashboard/commit/6c54bd82b872d5efed827c3582b4fb3f0aa24a95))

# [4.2.0-alpha.14](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.13...4.2.0-alpha.14) (2022-09-17)


### Features

* show skeleton as loading indicator in data browser while data is loading ([#2273](https://github.com/ParsePlatform/parse-dashboard/issues/2273)) ([059f616](https://github.com/ParsePlatform/parse-dashboard/commit/059f616718006c6f559b0b07a8da641367497d9a))

# [4.2.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.12...4.2.0-alpha.13) (2022-09-17)


### Features

* add column name to related records ([#2264](https://github.com/ParsePlatform/parse-dashboard/issues/2264)) ([cc82533](https://github.com/ParsePlatform/parse-dashboard/commit/cc82533ae3066daa7b789131a76a409720d45b0b))

# [4.2.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.11...4.2.0-alpha.12) (2022-09-14)


### Features

* auto-submit one-time password (OTP) after entering ([#2257](https://github.com/ParsePlatform/parse-dashboard/issues/2257)) ([e528705](https://github.com/ParsePlatform/parse-dashboard/commit/e5287054cff3bff368ba4e379eebf05bfb7d8bd5))

# [4.2.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.10...4.2.0-alpha.11) (2022-09-13)


### Bug Fixes

* column names in data browser menu not left-aligned ([#2263](https://github.com/ParsePlatform/parse-dashboard/issues/2263)) ([fc5673a](https://github.com/ParsePlatform/parse-dashboard/commit/fc5673a0ebbc7b4d51e122dbb71172803513309e))

# [4.2.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.9...4.2.0-alpha.10) (2022-09-12)


### Features

* add Node 18 support ([#2206](https://github.com/ParsePlatform/parse-dashboard/issues/2206)) ([bc7895a](https://github.com/ParsePlatform/parse-dashboard/commit/bc7895aadacc2cc6b0bbcfe786b73d7b82527e55))

# [4.2.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.8...4.2.0-alpha.9) (2022-09-12)


### Bug Fixes

* login fails with error `req.session.regenerate is not a function` ([#2260](https://github.com/ParsePlatform/parse-dashboard/issues/2260)) ([1dc2b91](https://github.com/ParsePlatform/parse-dashboard/commit/1dc2b915e16a2038268f886d4c24e7b081ae0531))

# [4.2.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.7...4.2.0-alpha.8) (2022-09-08)


### Features

* add option to auto-sort columns alphabetically ([#2252](https://github.com/ParsePlatform/parse-dashboard/issues/2252)) ([2b7f20f](https://github.com/ParsePlatform/parse-dashboard/commit/2b7f20fcc088f74915b50ec1219038ba9b233c27))

# [4.2.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.6...4.2.0-alpha.7) (2022-09-08)


### Bug Fixes

* dashboard contains invalid html for top-level document ([#2254](https://github.com/ParsePlatform/parse-dashboard/issues/2254)) ([bbce857](https://github.com/ParsePlatform/parse-dashboard/commit/bbce8579ef634bf8e6800f3a6ab8cd650e971695))

# [4.2.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.5...4.2.0-alpha.6) (2022-09-08)


### Features

* apply filter in data browser by pressing "Enter" key ([#2256](https://github.com/ParsePlatform/parse-dashboard/issues/2256)) ([bc4f9eb](https://github.com/ParsePlatform/parse-dashboard/commit/bc4f9eb9cad9eb8e362dca20bf932cb3d1e6721c))

# [4.2.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.4...4.2.0-alpha.5) (2022-09-06)


### Bug Fixes

* login fails with error `req.session.regenerate is not a function` ([#2197](https://github.com/ParsePlatform/parse-dashboard/issues/2197)) [skip release] ([014d9c1](https://github.com/ParsePlatform/parse-dashboard/commit/014d9c15b0c4efad8b0762e5a49f6a740ead5edb))
* unnecessary count operations in Data Browser ([#2250](https://github.com/ParsePlatform/parse-dashboard/issues/2250)) ([bfc1684](https://github.com/ParsePlatform/parse-dashboard/commit/bfc1684375b7c2120e2a4ae566e5b3c38c0ca110))

# [4.2.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.3...4.2.0-alpha.4) (2022-07-20)


### Bug Fixes

* security upgrade terser from 5.10.0 to 5.14.2 ([#2222](https://github.com/ParsePlatform/parse-dashboard/issues/2222)) ([645cfdd](https://github.com/ParsePlatform/parse-dashboard/commit/645cfdd5939aca429b988e7a7c1a1b6a68230810))

# [4.2.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.2...4.2.0-alpha.3) (2022-07-15)


### Bug Fixes

* button text "Show all" in column menu is truncated ([#2208](https://github.com/ParsePlatform/parse-dashboard/issues/2208)) ([b89d044](https://github.com/ParsePlatform/parse-dashboard/commit/b89d044a504c6748932907f075819a13aa08fb51))

# [4.2.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.2.0-alpha.1...4.2.0-alpha.2) (2022-07-11)


### Features

* improve button labels to be more concise in text ([#2207](https://github.com/ParsePlatform/parse-dashboard/issues/2207)) ([230fc14](https://github.com/ParsePlatform/parse-dashboard/commit/230fc1419db4d4de67c7e591cde415dbbe461c84))

# [4.2.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.3-alpha.1...4.2.0-alpha.1) (2022-07-04)


### Bug Fixes

* login fails with error `req.session.regenerate is not a function` ([#2195](https://github.com/ParsePlatform/parse-dashboard/issues/2195)) [skip release] ([31a2b78](https://github.com/ParsePlatform/parse-dashboard/commit/31a2b7813531e370e11b1a050ea28b575a058816))

### Features

* remove support and documentation links ([#2203](https://github.com/ParsePlatform/parse-dashboard/issues/2203)) ([35e4476](https://github.com/ParsePlatform/parse-dashboard/commit/35e44768f65c64a228cb6ea8314aa534c5342f08))

## [4.1.3-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.2...4.1.3-alpha.1) (2022-06-18)


### Bug Fixes

* security upgrade semver-regex from 3.1.3 to 3.1.4 ([#2154](https://github.com/ParsePlatform/parse-dashboard/issues/2154)) ([4f9090a](https://github.com/ParsePlatform/parse-dashboard/commit/4f9090ad22460913f7987964ee54f26d348ca254))

## [4.1.2-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.2-alpha.2...4.1.2-alpha.3) (2022-06-04)


### Bug Fixes

* security upgrade semver-regex from 3.1.3 to 3.1.4 ([#2154](https://github.com/ParsePlatform/parse-dashboard/issues/2154)) ([4f9090a](https://github.com/ParsePlatform/parse-dashboard/commit/4f9090ad22460913f7987964ee54f26d348ca254))

## [4.1.2-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.2-alpha.1...4.1.2-alpha.2) (2022-05-30)


### Bug Fixes

* config options like `--port` or `--config` are ignored ([#2113](https://github.com/ParsePlatform/parse-dashboard/issues/2113)) ([6d70d8a](https://github.com/ParsePlatform/parse-dashboard/commit/6d70d8aa74caf0d9c0d335a99a48347dc412ac4e))
* preserve previous condition field value on constraint change ([#1969](https://github.com/ParsePlatform/parse-dashboard/issues/1969)) ([f4c3060](https://github.com/ParsePlatform/parse-dashboard/commit/f4c30605f675bd7a681be127b2dfb3fc11f90e32))
* security upgrade node-fetch from 2.6.5 to 2.6.7 ([#2114](https://github.com/ParsePlatform/parse-dashboard/issues/2114)) ([5423b0d](https://github.com/ParsePlatform/parse-dashboard/commit/5423b0d70cb72081933ed7531a55f49d39f3b92c))
* upgrade graphiql from 1.8.4 to 1.8.5 ([#2111](https://github.com/ParsePlatform/parse-dashboard/issues/2111)) ([1a50d30](https://github.com/ParsePlatform/parse-dashboard/commit/1a50d30b6b7d769e04c2c8e82d60142dd2e52b70))

### Reverts

* feat: change string filter description ([#2059](https://github.com/ParsePlatform/parse-dashboard/issues/2059)) ([db5d23b](https://github.com/ParsePlatform/parse-dashboard/commit/db5d23bf17f65d0db3e5d0d4ef4ca506d8394fb9))

## [4.1.2-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.1...4.1.2-alpha.1) (2022-05-01)


### Bug Fixes

* data export is missing rows when exporting more than 100 rows ([#2087](https://github.com/ParsePlatform/parse-dashboard/issues/2087)) ([a070627](https://github.com/ParsePlatform/parse-dashboard/commit/a070627223a93a05b9784754a65f023278521efe))
* security upgrade async from 2.6.3 to 2.6.4 ([#2094](https://github.com/ParsePlatform/parse-dashboard/issues/2094)) ([6140ef7](https://github.com/ParsePlatform/parse-dashboard/commit/6140ef78b9444741e64c6e46eb3344bc9fbf61e8))
* security upgrade cross-fetch from 3.1.4 to 3.1.5 ([#2105](https://github.com/ParsePlatform/parse-dashboard/issues/2105)) ([24ca77f](https://github.com/ParsePlatform/parse-dashboard/commit/24ca77fbce6b580ccaccb9812a8f6dcb53304e67))

## [4.1.1-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.1-alpha.3...4.1.1-alpha.4) (2022-04-28)


### Bug Fixes

* security upgrade cross-fetch from 3.1.4 to 3.1.5 ([#2105](https://github.com/ParsePlatform/parse-dashboard/issues/2105)) ([ac2609f](https://github.com/ParsePlatform/parse-dashboard/commit/ac2609f9e9bbf82e61e0b627565cd25969cfd5ba))

## [4.1.1-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.1-alpha.2...4.1.1-alpha.3) (2022-04-15)


### Bug Fixes

* data export is missing rows when exporting more than 100 rows ([#2087](https://github.com/ParsePlatform/parse-dashboard/issues/2087)) ([db2d59e](https://github.com/ParsePlatform/parse-dashboard/commit/db2d59e899357e7166b28baabf8639e8078fa759))

## [4.1.1-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.1-alpha.1...4.1.1-alpha.2) (2022-04-15)


### Bug Fixes

* security upgrade async from 2.6.3 to 2.6.4 ([#2094](https://github.com/ParsePlatform/parse-dashboard/issues/2094)) ([61e0fb7](https://github.com/ParsePlatform/parse-dashboard/commit/61e0fb729731cb7cfb825cc2775c034f4e211f1a))

## [4.1.1-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.0...4.1.1-alpha.1) (2022-04-04)


### Bug Fixes

* security upgrade js-beautify from 1.14.0 to 1.14.1 ([#2077](https://github.com/ParsePlatform/parse-dashboard/issues/2077)) ([e4ea787](https://github.com/ParsePlatform/parse-dashboard/commit/e4ea7879d88173b02d66b1339ba98805255ba82c))
* security vulnerability bump minimist from 1.2.5 to 1.2.6 ([#2070](https://github.com/ParsePlatform/parse-dashboard/issues/2070)) ([3d0407e](https://github.com/ParsePlatform/parse-dashboard/commit/3d0407ebd75051bbbe6f0a2aba87b26475e901b9))

# [4.1.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.0-alpha.2...4.1.0-alpha.3) (2022-03-30)


### Bug Fixes

* security upgrade js-beautify from 1.14.0 to 1.14.1 ([#2077](https://github.com/ParsePlatform/parse-dashboard/issues/2077)) ([74aa7d0](https://github.com/ParsePlatform/parse-dashboard/commit/74aa7d03bebf925f90b92be76925a522c44e1031))

# [4.1.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.1.0-alpha.1...4.1.0-alpha.2) (2022-03-24)


### Bug Fixes

* security vulnerability bump minimist from 1.2.5 to 1.2.6 ([#2070](https://github.com/ParsePlatform/parse-dashboard/issues/2070)) ([9730379](https://github.com/ParsePlatform/parse-dashboard/commit/973037980aab05680072eba8a313b0f6280e12b7))

# [4.1.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.1...4.1.0-alpha.1) (2022-03-23)


### Bug Fixes

* adding internal class (e.g. `_User`) fails due to prefixed underscore ([#2036](https://github.com/ParsePlatform/parse-dashboard/issues/2036)) ([e004e70](https://github.com/ParsePlatform/parse-dashboard/commit/e004e701737718f010978b0830d64bf8e1d8c559))
* security upgrade prismjs from 1.26.0 to 1.27.0 ([#2047](https://github.com/ParsePlatform/parse-dashboard/issues/2047)) ([ffbca12](https://github.com/ParsePlatform/parse-dashboard/commit/ffbca12c80bf32052a1a2b5d315c8a3393d82248))
* upgrade @babel/runtime from 7.17.0 to 7.17.2 ([#2055](https://github.com/ParsePlatform/parse-dashboard/issues/2055)) ([3e8449b](https://github.com/ParsePlatform/parse-dashboard/commit/3e8449b1679f803e9d26876ccfd28f88fea814ff))
* upgrade express from 4.17.2 to 4.17.3 ([#2058](https://github.com/ParsePlatform/parse-dashboard/issues/2058)) ([d1357de](https://github.com/ParsePlatform/parse-dashboard/commit/d1357de1281244f040499a2ca54db0faee4d882c))
* upgrade otpauth from 7.0.10 to 7.0.11 ([#2061](https://github.com/ParsePlatform/parse-dashboard/issues/2061)) ([05c5ac8](https://github.com/ParsePlatform/parse-dashboard/commit/05c5ac87a6cf1675889e58330276dac185929a01))

### Features

* change string filter description ([#2059](https://github.com/ParsePlatform/parse-dashboard/issues/2059)) ([6470c8e](https://github.com/ParsePlatform/parse-dashboard/commit/6470c8e3221e3b4ec95ecd831726a914d24ff619))

# [4.0.0-alpha.21](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.20...4.0.0-alpha.21) (2022-03-18)


### Bug Fixes

* upgrade otpauth from 7.0.10 to 7.0.11 ([#2061](https://github.com/ParsePlatform/parse-dashboard/issues/2061)) ([c379306](https://github.com/ParsePlatform/parse-dashboard/commit/c3793061a186d49ab09e8bd448e167078d1e4df7))

# [4.0.0-alpha.20](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.19...4.0.0-alpha.20) (2022-03-16)


### Features

* change string filter description ([#2059](https://github.com/ParsePlatform/parse-dashboard/issues/2059)) ([bb1e184](https://github.com/ParsePlatform/parse-dashboard/commit/bb1e184272497749630964b4bd9e610d2d4cd328))

# [4.0.0-alpha.19](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.18...4.0.0-alpha.19) (2022-03-10)


### Bug Fixes

* upgrade express from 4.17.2 to 4.17.3 ([#2058](https://github.com/ParsePlatform/parse-dashboard/issues/2058)) ([f8dc602](https://github.com/ParsePlatform/parse-dashboard/commit/f8dc6027f57143d72083f593455b23e304de934a))

# [4.0.0-alpha.18](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.17...4.0.0-alpha.18) (2022-03-02)


### Bug Fixes

* upgrade @babel/runtime from 7.17.0 to 7.17.2 ([#2055](https://github.com/ParsePlatform/parse-dashboard/issues/2055)) ([93335e9](https://github.com/ParsePlatform/parse-dashboard/commit/93335e9ab52e7b1f203b7939abde5c12b42dd2a7))

# [4.0.0-alpha.17](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.16...4.0.0-alpha.17) (2022-02-23)


### Bug Fixes

* security upgrade prismjs from 1.26.0 to 1.27.0 ([#2047](https://github.com/ParsePlatform/parse-dashboard/issues/2047)) ([3afb24e](https://github.com/ParsePlatform/parse-dashboard/commit/3afb24e708a69560732a725574953333431c1ca9))

# [4.0.0-alpha.16](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.15...4.0.0-alpha.16) (2022-02-10)


### Bug Fixes

* adding internal class (e.g. `_User`) fails due to prefixed underscore ([#2036](https://github.com/ParsePlatform/parse-dashboard/issues/2036)) ([f80bd07](https://github.com/ParsePlatform/parse-dashboard/commit/f80bd07a42b19fc4fa2632e0147fa72812a87c2f))

# [4.0.0-alpha.15](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.14...4.0.0-alpha.15) (2022-01-26)


### Bug Fixes

* preserve column sorting preferences in data browser ([#2016](https://github.com/ParsePlatform/parse-dashboard/issues/2016)) ([c2e6557](https://github.com/ParsePlatform/parse-dashboard/commit/c2e65573ccfa29b6d6e727e93b9552380c520f86))

# [4.0.0-alpha.14](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.13...4.0.0-alpha.14) (2022-01-23)


### Bug Fixes

* crash when checking for new dashboard release without internet connection ([#2015](https://github.com/ParsePlatform/parse-dashboard/issues/2015)) ([8c36e69](https://github.com/ParsePlatform/parse-dashboard/commit/8c36e693c08a960c4002d7d29bde7d111eff2cd4))

# [4.0.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.12...4.0.0-alpha.13) (2022-01-23)


### Bug Fixes

* calendar widget layout partly hides last days of a month ([#1990](https://github.com/ParsePlatform/parse-dashboard/issues/1990)) ([5bd86dd](https://github.com/ParsePlatform/parse-dashboard/commit/5bd86dd0a5c7857705089cb8a57c078d62863dfc))

# [4.0.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.11...4.0.0-alpha.12) (2022-01-23)


### Bug Fixes

* upgrade parse from 3.4.0 to 3.4.1 ([#2011](https://github.com/ParsePlatform/parse-dashboard/issues/2011)) ([68cf9e2](https://github.com/ParsePlatform/parse-dashboard/commit/68cf9e238594df29c22a687b2976d56894897f34))

# [4.0.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.10...4.0.0-alpha.11) (2022-01-23)


### Bug Fixes

* various UI bugs (e.g. filter data browser, switch app, upload file) ([#2010](https://github.com/ParsePlatform/parse-dashboard/issues/2010)) ([a508a58](https://github.com/ParsePlatform/parse-dashboard/commit/a508a58ce927fd7e08d249818c38f6fb1305956c))

# [4.0.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.9...4.0.0-alpha.10) (2022-01-22)


### Bug Fixes

* bump nanoid from 3.1.28 to 3.2.0 ([#2008](https://github.com/ParsePlatform/parse-dashboard/issues/2008)) ([6cfe9ca](https://github.com/ParsePlatform/parse-dashboard/commit/6cfe9cae63a49013489e5683b5e16ab3c4399730))

# [4.0.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.8...4.0.0-alpha.9) (2022-01-18)


### Bug Fixes

* cannot save nullish values for required fields ([#2003](https://github.com/ParsePlatform/parse-dashboard/issues/2003)) ([e1a5497](https://github.com/ParsePlatform/parse-dashboard/commit/e1a5497d4a999d18dcf60f93cdba16d36250a7cc))

# [4.0.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.7...4.0.0-alpha.8) (2022-01-15)


### Bug Fixes

* bump marked from 0.8.2 to 4.0.10 ([#2001](https://github.com/ParsePlatform/parse-dashboard/issues/2001)) ([ae4cc90](https://github.com/ParsePlatform/parse-dashboard/commit/ae4cc900bdbdc4425f0f30c07c6ef689c8cebe8c))

# [4.0.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.6...4.0.0-alpha.7) (2022-01-13)


### Bug Fixes

* bump follow-redirects from 1.14.4 to 1.14.7 ([#1997](https://github.com/ParsePlatform/parse-dashboard/issues/1997)) ([4ca2e97](https://github.com/ParsePlatform/parse-dashboard/commit/4ca2e971890c6ee7ee88195a4c75dbb73dc5a0b1))

# [4.0.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.5...4.0.0-alpha.6) (2022-01-13)


### Bug Fixes

* bump markdown-it from 12.3.0 to 12.3.2 ([#1996](https://github.com/ParsePlatform/parse-dashboard/issues/1996)) ([245c22e](https://github.com/ParsePlatform/parse-dashboard/commit/245c22ea21f1af6f3e74a269d74460d5c5ea5c03))

# [4.0.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.4...4.0.0-alpha.5) (2021-12-12)


### Bug Fixes

* opening filter menu in data browser leads to blank page ([#1958](https://github.com/ParsePlatform/parse-dashboard/issues/1958)) ([750e8b1](https://github.com/ParsePlatform/parse-dashboard/commit/750e8b1f018e37360e6577f423da005d7f773f20))

# [4.0.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.3...4.0.0-alpha.4) (2021-12-06)


### Features

* upgrade graphql from 15.7.0 to 16.0.0 ([#1926](https://github.com/ParsePlatform/parse-dashboard/issues/1926)) ([7c94e51](https://github.com/ParsePlatform/parse-dashboard/commit/7c94e512ed5428797823d24ac205ece59e94f3ea))


### BREAKING CHANGES

* The minimum required Node.js version is 12.22.0. ([7c94e51](7c94e51))

# [4.0.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.2...4.0.0-alpha.3) (2021-12-06)


### Features

* upgrade parse from 3.3.1 to 3.4.0 ([#1942](https://github.com/ParsePlatform/parse-dashboard/issues/1942)) ([13a250e](https://github.com/ParsePlatform/parse-dashboard/commit/13a250e2e04ba0f12be0c2da8c9075ea8eb4d83f))

# [4.0.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/4.0.0-alpha.1...4.0.0-alpha.2) (2021-12-06)


### Bug Fixes

* security upgrade qrcode from 1.4.4 to 1.5.0 ([#1930](https://github.com/ParsePlatform/parse-dashboard/issues/1930)) ([244e1bb](https://github.com/ParsePlatform/parse-dashboard/commit/244e1bba1a3fb89b9ed8c93a3d0f7163eacd2691))

# [4.0.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.17...4.0.0-alpha.1) (2021-12-05)


### Features

* upgrade graphiql from 1.4.7 to 1.5.1 ([#1943](https://github.com/ParsePlatform/parse-dashboard/issues/1943)) ([ebb1f66](https://github.com/ParsePlatform/parse-dashboard/commit/ebb1f660f1d10921f92d05eb58b09d548e00d3a9))


### BREAKING CHANGES

* The required Node version was increased to >=12.20.0. ([ebb1f66](ebb1f66))

# [3.3.0-alpha.17](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.16...3.3.0-alpha.17) (2021-12-05)


### Bug Fixes

* saving relation column fails if class has required fields ([#1937](https://github.com/ParsePlatform/parse-dashboard/issues/1937)) ([c67db08](https://github.com/ParsePlatform/parse-dashboard/commit/c67db083a9657be2d16ba566a7f6ce497fd66092))

# [3.3.0-alpha.16](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.15...3.3.0-alpha.16) (2021-11-09)


### Bug Fixes

* bump graphiql from 1.4.6 to 1.4.7 ([#1920](https://github.com/ParsePlatform/parse-dashboard/issues/1920)) ([26c0dfa](https://github.com/ParsePlatform/parse-dashboard/commit/26c0dfa7eaa68194d53beaeed1ca6705f3d11a6a))

# [3.3.0-alpha.15](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.14...3.3.0-alpha.15) (2021-11-02)


### Bug Fixes

* context menu in data browser not opening for cell of type number ([#1913](https://github.com/ParsePlatform/parse-dashboard/issues/1913)) ([fb0e3a9](https://github.com/ParsePlatform/parse-dashboard/commit/fb0e3a9882438069fef1d7926ec74bad6bb3eebc))

# [3.3.0-alpha.14](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.13...3.3.0-alpha.14) (2021-10-30)


### Bug Fixes

* notification to upgrade dashboard for latest features not working ([#1894](https://github.com/ParsePlatform/parse-dashboard/issues/1894)) ([81361b6](https://github.com/ParsePlatform/parse-dashboard/commit/81361b67946a347d31ef96d61e3dd11503a6ad5b))

# [3.3.0-alpha.13](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.12...3.3.0-alpha.13) (2021-10-27)


### Features

* add config option `columnPreference.filterSortToTop` to set column name order in filter dialog ([#1884](https://github.com/ParsePlatform/parse-dashboard/issues/1884)) ([3acbda1](https://github.com/ParsePlatform/parse-dashboard/commit/3acbda1cf2adfaa4471ef761c81e000eb1d04a97))

# [3.3.0-alpha.12](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.11...3.3.0-alpha.12) (2021-10-27)


### Bug Fixes

* manual column preferences are overwritten by columnPreference option on page refresh ([#1881](https://github.com/ParsePlatform/parse-dashboard/issues/1881)) ([7232b0b](https://github.com/ParsePlatform/parse-dashboard/commit/7232b0b13916ee9bc409279242b5d4bbc4fee033))

# [3.3.0-alpha.11](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.10...3.3.0-alpha.11) (2021-10-27)


### Bug Fixes

* upgrade graphql from 15.6.0 to 15.6.1 ([#1887](https://github.com/ParsePlatform/parse-dashboard/issues/1887)) ([0cfe59e](https://github.com/ParsePlatform/parse-dashboard/commit/0cfe59e475d9f991a3579eb81e8e8a24705eec6a))

# [3.3.0-alpha.10](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.9...3.3.0-alpha.10) (2021-10-27)


### Bug Fixes

* upgrade inquirer from 8.1.3 to 8.2.0 ([#1886](https://github.com/ParsePlatform/parse-dashboard/issues/1886)) ([c77f335](https://github.com/ParsePlatform/parse-dashboard/commit/c77f335f6203842d0c83bc161ced0376ae166f26))

# [3.3.0-alpha.9](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.8...3.3.0-alpha.9) (2021-10-20)


### Features

* add visual distinction in data browser for internal classes and display their real names with underscore ([#1878](https://github.com/ParsePlatform/parse-dashboard/issues/1878)) ([ac8d85e](https://github.com/ParsePlatform/parse-dashboard/commit/ac8d85e368d1ff0f2bc644b30264b9af7c86c76d))

# [3.3.0-alpha.8](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.7...3.3.0-alpha.8) (2021-10-20)


### Bug Fixes

* app icons are cropped in the app list for small screen sizes ([#1876](https://github.com/ParsePlatform/parse-dashboard/issues/1876)) ([9fc56a6](https://github.com/ParsePlatform/parse-dashboard/commit/9fc56a6be210d82c4f1b03e804bd492d0848a62d))

# [3.3.0-alpha.7](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.6...3.3.0-alpha.7) (2021-10-20)


### Bug Fixes

* upload of file as default value fails when adding a new column ([#1875](https://github.com/ParsePlatform/parse-dashboard/issues/1875)) ([6040dd0](https://github.com/ParsePlatform/parse-dashboard/commit/6040dd0dfe3315131dfeccc42f54cdf4d6d6b90e))

# [3.3.0-alpha.6](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.5...3.3.0-alpha.6) (2021-10-20)


### Bug Fixes

* always pass boolean value when toggling checkbox ([#1872](https://github.com/ParsePlatform/parse-dashboard/issues/1872)) ([2e9fd59](https://github.com/ParsePlatform/parse-dashboard/commit/2e9fd59c2ce33f60c904213dc0b5956c4fbfe0c9))

# [3.3.0-alpha.5](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.4...3.3.0-alpha.5) (2021-10-15)


### Bug Fixes

* upgrade passport from 0.4.1 to 0.5.0 ([#1865](https://github.com/ParsePlatform/parse-dashboard/issues/1865)) ([8d845f0](https://github.com/ParsePlatform/parse-dashboard/commit/8d845f0b59d161d21b6b28691b9962869fac2f20))

# [3.3.0-alpha.4](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.3...3.3.0-alpha.4) (2021-10-13)


### Bug Fixes

* link icon in pointer cell not visible when cell is too narrow ([#1856](https://github.com/ParsePlatform/parse-dashboard/issues/1856)) ([69b897d](https://github.com/ParsePlatform/parse-dashboard/commit/69b897d17f379f9e5af1a0f64c557f54054ebe67))

# [3.3.0-alpha.3](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.2...3.3.0-alpha.3) (2021-10-11)


### Bug Fixes

* upgrade graphql from 15.4.0 to 15.6.0 ([#1853](https://github.com/ParsePlatform/parse-dashboard/issues/1853)) ([fca9b14](https://github.com/ParsePlatform/parse-dashboard/commit/fca9b14cbe23ea0537bebb48bc390484932257c7))

# [3.3.0-alpha.2](https://github.com/ParsePlatform/parse-dashboard/compare/3.3.0-alpha.1...3.3.0-alpha.2) (2021-10-11)


### Features

* add pointer representation by a chosen column instead of objectId ([#1852](https://github.com/ParsePlatform/parse-dashboard/issues/1852)) ([d747786](https://github.com/ParsePlatform/parse-dashboard/commit/d7477860ebf972a1cb69a43761e77841831754e2))

# [3.3.0-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.2.1-alpha.1...3.3.0-alpha.1) (2021-10-08)


### Features

* allow GraphIQL headers ([#1836](https://github.com/ParsePlatform/parse-dashboard/issues/1836)) ([3afcf73](https://github.com/ParsePlatform/parse-dashboard/commit/3afcf730c1303b3957ab03d683ada86242175579))

## [3.2.1-alpha.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.2.0...3.2.1-alpha.1) (2021-10-08)


### Bug Fixes

* enabling context menu for read-only cells ([#1844](https://github.com/ParsePlatform/parse-dashboard/issues/1844)) ([a38a885](https://github.com/ParsePlatform/parse-dashboard/commit/a38a885db23e3a76c1e24f880e061dc882e1d37f))
