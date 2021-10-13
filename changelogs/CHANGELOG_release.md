## [3.2.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.2.0...3.2.1) (2021-10-08)


### Bug Fixes

* enabling context menu for read-only cells ([#1844](https://github.com/ParsePlatform/parse-dashboard/issues/1844)) ([a38a885](https://github.com/ParsePlatform/parse-dashboard/commit/a38a885db23e3a76c1e24f880e061dc882e1d37f))

# [3.2.0](https://github.com/ParsePlatform/parse-dashboard/compare/3.1.2...3.2.0) (2021-10-05)


### Features

* add ctrl + arrow key to jump to first/last cell; fix left/right key navigation with hidden columns ([#1827](https://github.com/ParsePlatform/parse-dashboard/issues/1827)) ([b504c0f](https://github.com/ParsePlatform/parse-dashboard/commit/b504c0fc555e0b8adc2ce796cd6928ea05bb3092))

## [3.1.2](https://github.com/ParsePlatform/parse-dashboard/compare/3.1.1...3.1.2) (2021-10-04)


### Refactor

* upgrade react-router-dom from 5.2.1 to 5.3.0 ([#1817](https://github.com/ParsePlatform/parse-dashboard/pull/1817)) ([8f359b3](https://github.com/ParsePlatform/parse-dashboard/commit/8f359b326dc69c7294ca8a208533cf58280357ad))

## [3.1.1](https://github.com/ParsePlatform/parse-dashboard/compare/3.1.0...3.1.1) (2021-09-30)


### Bug Fixes

* incorrect autofocus for login form input fields ([#1825](https://github.com/ParsePlatform/parse-dashboard/issues/1825)) ([7ca6aae](https://github.com/ParsePlatform/parse-dashboard/commit/7ca6aaed7e748057662017224b4a796ce8b6c99e))

# [3.1.0](https://github.com/ParsePlatform/parse-dashboard/compare/3.0.0...3.1.0) (2021-09-29)


### Features

* add support for npm 7 and Node 16, migrate to graphiql ([#1807](https://github.com/ParsePlatform/parse-dashboard/issues/1807)) ([b61fc7f](https://github.com/ParsePlatform/parse-dashboard/commit/b61fc7fadad608699634e3ff57d0df3a76c6d74a))

# 3.0.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.2.0...3.0.0)

## BREAKING CHANGE
- Parse Dashboard requires Node >=12.0.0 <16.0.0
- Reverts PR [#1706](https://github.com/parse-community/parse-dashboard/pull/1706) which introduced new database index requirements for pagination and was a breaking change that can lead to database performance issues if database indices were not adapted; reverting #1706 removes the `objectId` from the compound query; make sure that the database indices satisfy your dashboard sorting and filter usage before upgrading to this release to prevent database performance issues due to missing indices (Christopher Brookes) [#1800](https://github.com/parse-community/parse-dashboard/pull/1800)

## New Features
- Add multi-factor authentication to dashboard login. To use one-time password, run `parse-dashboard --createMFA` or `parse-dashboard --createUser`. (Daniel Blyth) [#1624](https://github.com/parse-community/parse-dashboard/pull/1624)

## Improvements
- Sidebar: Class counts are now updated when all counts are returned instead of after each call (Christopher Brookes) [#1802](https://github.com/parse-community/parse-dashboard/pull/1802)
- Update sass to 5.0.0 and make docker image use node:lts-alpine (Corey Baker) [#1792](https://github.com/parse-community/parse-dashboard/pull/1792)
- Docker image use now node 12 version (Christopher Brookes) [#1788](https://github.com/parse-community/parse-dashboard/pull/1788)
- CI now pushes docker images to Docker Hub (Corey Baker) [#1781](https://github.com/parse-community/parse-dashboard/pull/1781)
- Add CI check to add changelog entry (Manuel Trezza) [#1764](https://github.com/parse-community/parse-dashboard/pull/1764)
- Refactor: uniform issue templates across repos (Manuel Trezza) [#1767](https://github.com/parse-community/parse-dashboard/pull/1767)
- fix: date cell value not selected on double clicks (fn-faisal) [#1730](https://github.com/parse-community/parse-dashboard/pull/1730)

## Fixes
- Fixed bug after creating new class, wrong CLP was shown for that class [#1784](https://github.com/parse-community/parse-dashboard/issues/1784)  (Prerna Mehra) [#1785](https://github.com/parse-community/parse-dashboard/pull/1785)
- Fixed bug when opening a big modal, modal content is not visible due to Sidebar (Prerna Mehra) [#1777](https://github.com/parse-community/parse-dashboard/pull/1778)
- Fixed UI for a field containing an array of pointers (Prerna Mehra) [#1776](https://github.com/parse-community/parse-dashboard/pull/1776)
- Fixed bug when editing or copying a field containing an array of pointers [#1770](https://github.com/parse-community/parse-dashboard/issues/1770) (Prerna Mehra) [#1771](https://github.com/parse-community/parse-dashboard/pull/1771)
- Modernize CI (Manuel Trezza) [#1789](https://github.com/parse-community/parse-dashboard/pull/1789)
- ci: Remove parse-server dev dependency (Manuel Trezza) [#1796](https://github.com/parse-community/parse-dashboard/pull/1796)

# 2.2.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.1.0...2.2.0)

## New Features
- Added data export in CSV format for classes (Cory Imdieke, Manuel Trezza) [#1494](https://github.com/parse-community/parse-dashboard/pull/1494)
- Added collapsing sidebar for small screens (Douglas Muraoka, Manuel Trezza) [#1760](https://github.com/parse-community/parse-dashboard/pull/1760)
- Added exclude hidden columns from being fetched from server (itzharDev) [#1694](https://github.com/parse-community/parse-dashboard/pull/1694)
- Added cloning rows (Prerna Mehra) [#1697](https://github.com/parse-community/parse-dashboard/pull/1697)
- Added `Cmd`-click on pointer to open link in new browser tab (fn-faisal) [#1757](https://github.com/parse-community/parse-dashboard/pull/1757)
- Added browsing as another user (Nino Črljenec, Manuel Trezza) [#1750](https://github.com/parse-community/parse-dashboard/pull/1750)
- Added `columnPreference.preventSort` configuration option to prevent a column from being used for sorting (Christopher Brookes) [#1709](https://github.com/parse-community/parse-dashboard/pull/1709)
- Added `columnPreference` configuration option for data browser (dblythy) [#1625](https://github.com/parse-community/parse-dashboard/pull/1625)

## Improvements
- Improved navigation by redesigning pointer cell with link icon (Prerna Mehra) [#1708](https://github.com/parse-community/parse-dashboard/pull/1708)
- Improved rendering an array of pointers in cell (fn-faisal) [#1727](https://github.com/parse-community/parse-dashboard/pull/1727)
- Improved flow when creating a class and adding columns (fn-faisal) [#1728](https://github.com/parse-community/parse-dashboard/pull/1728)
- Added indication of required fields when adding new row (Prerna Mehra) [#1720](https://github.com/parse-community/parse-dashboard/pull/1720)
- Added indication of auto-populated fields when adding new row (Prerna Mehra) [#1692](https://github.com/parse-community/parse-dashboard/pull/1692)
- Added cancel button while adding a new row (Prerna Mehra) [#1690](https://github.com/parse-community/parse-dashboard/pull/1690)
- Added progress indicator when uploading a file in modal dialog (Prerna Mehra) [#1717](https://github.com/parse-community/parse-dashboard/pull/1717)
- Added tooltip for read-only fields (Prerna Mehra) [#1688](https://github.com/parse-community/parse-dashboard/pull/1688)
- Added message when no locale is set for localizing push notifications (Prerna Mehra) [#1685](https://github.com/parse-community/parse-dashboard/pull/1685)
- Updated to Parse JS SDK 3.3.0 (Manuel Trezza) [#1745](https://github.com/parse-community/parse-dashboard/pull/1745)
- Transitioned CI to GitHub Actions (Diamond Lewis) [#1640](https://github.com/parse-community/parse-dashboard/pull/1640)
- Added finish date to Cloud Job status (Diamond Lewis) [#1620](https://github.com/parse-community/parse-dashboard/pull/1620)

## Fixes
- Fixed clear state.data when setting relation to prevent column type mismatch (John Dillick) [#1564](https://github.com/parse-community/parse-dashboard/pull/1564)
- Fixed incorrect setting of pointer CLPs (mess-lelouch) [#1556](https://github.com/parse-community/parse-dashboard/pull/1556)
- Fixed master key not being passed in when saving file in global config (stevestencil) [#1581](https://github.com/parse-community/parse-dashboard/pull/1581)
- Fixes toolbar overlap to page title (Sergei Smirnov) [#1578](https://github.com/parse-community/parse-dashboard/pull/1578)
- Fixed various issues with edit row dialog (Nino Črljenec) [#1586](https://github.com/parse-community/parse-dashboard/pull/1586)
- Fixed date filters in data browser (Prerna Mehra) [#1682](https://github.com/parse-community/parse-dashboard/pull/1682)
- Fixed `expiresAt` field in `Session` class not appearing as read-only (Prerna Mehra) [#1686](https://github.com/parse-community/parse-dashboard/pull/1686)
- Fixed missing error message on failed clone row task (Prerna Mehra) [#1687](https://github.com/parse-community/parse-dashboard/pull/1687)
- Fixes missing or duplicate rows displayed when scrolling; this fix may require the additional creation of database indices to avoid performance issues, see PR discussion (Prerna Mehra) [#1706](https://github.com/parse-community/parse-dashboard/pull/1706)
- Fixed missing key binding for copy, paste, cancel while adding a new row (Christopher Brookes) [#1714](https://github.com/parse-community/parse-dashboard/pull/1714)
- Fixed setup locales message when adding all locales to push notification (Prerna Mehra) [#1691](https://github.com/parse-community/parse-dashboard/pull/1691)
- Fixed no error message displayed when trying to add column with a name that has a leading number (Prerna Mehra) [#1718](https://github.com/parse-community/parse-dashboard/pull/1718)
- Fixed fetching data when un-hiding column despite that data is already cached (Prerna Mehra) [#1734](https://github.com/parse-community/parse-dashboard/pull/1734)
- Fixed incorrect documentation (Philipp B) [#1592](https://github.com/parse-community/parse-dashboard/pull/1592)
- Fixed various dependency vulnerabilities

# 2.1.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.5...2.1.0)

__New features:__
* Added JS Console to run custom queries ([#1464](https://github.com/parse-community/parse-dashboard/pull/1464)), thanks to [Pedro Mutter](https://github.com/MutterPedro).
* View/Edit single row modal ([#1448](https://github.com/parse-community/parse-dashboard/pull/1448)), thanks to [NIno Črljenec](https://github.com/NinoZX).
* Context menu with quick filters and links to related records in other Parse Objects ([#1431](https://github.com/parse-community/parse-dashboard/pull/1431)), thanks to [404-html](https://github.com/404-html).
* Add ProtectedFields dialog and enhance Permissions dialogs ([#1478](https://github.com/parse-community/parse-dashboard/pull/1478)), thanks to [Old Grandpa](https://github.com/BufferUnderflower).

__Improvements:__
* Added config param delete confirmation dialog ([#1443](https://github.com/parse-community/parse-dashboard/pull/1443)), thanks to [Manuel Trezza](https://github.com/mtrezza).

__Fixes:__
* Inifite scroll not working ([#1432](https://github.com/parse-community/parse-dashboard/pull/1432)), thanks to [Douglas Muraoka](https://github.com/douglasmuraoka).
* Fix crash in import semver re: npm/node-semver#305 ([#1441](https://github.com/parse-community/parse-dashboard/pull/1441)), thanks to [Ben Petty](https://github.com/benpetty).
* Taking hidden columns into account when calculating Editor position ([#1438](https://github.com/parse-community/parse-dashboard/pull/1438)), thanks to [404-html](https://github.com/404-html).
* Fix audience conditions when Installation class does not exist ([#1451](https://github.com/parse-community/parse-dashboard/pull/1451)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo).

### 2.0.5
 [Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.4...2.0.5)
 * Fix: delete and regenerate package-lock to fix broken build

### 2.0.4
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.3...2.0.4)
* Fix: Restore `ObjectId` to filter ([#1315](https://github.com/parse-community/parse-dashboard/pull/1315)), thanks to [Wolfwood](https://github.com/W0lfw00d)
* Fix: Prevent duplicate entries when sorting by `createdAt` ([#1334](https://github.com/parse-community/parse-dashboard/pull/1334)), thanks to [Wolfwood](https://github.com/W0lfw00d)

### 2.0.3
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.2...2.0.3)
* Fix: Feature "masterkey parameters" requires Parse Server >= 3.9.0 ([#1281](https://github.com/parse-community/parse-dashboard/pull/1281)), thanks to [Manuel Trezza](https://github.com/mtrezza)
* Fix: CLP dialog for pointer fields ([#1283](https://github.com/parse-community/parse-dashboard/pull/1283)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)
* Fix: Force pointer array items to always be pointers ([#1291](https://github.com/parse-community/parse-dashboard/pull/1291)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)

### 2.0.2
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.1...2.0.2)
* Fix: filter tab not working for _User, and ohter classes starting with _ ([#1275](https://github.com/parse-community/parse-dashboard/pull/1275)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)
* Fix: Data Browser is not updating accordingly ([#1276](https://github.com/parse-community/parse-dashboard/pull/1276)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)
* NEW: Copy cell value using CTRL+C ([#1272](https://github.com/parse-community/parse-dashboard/pull/1272)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* Docs: Update NodeJS required version in README ([#1265](https://github.com/parse-community/parse-dashboard/pull/1265)), thanks to [Jerome](https://github.com/JeromeDeLeon)

### 2.0.1
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.0.0...2.0.1)
* Publishing it again since there is an old test 2.0.0 release already published to npm

### 2.0.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.4.3...2.0.0)
* Fix: Cell edit not updating partial view ([#1255](https://github.com/parse-community/parse-dashboard/pull/1255)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* Improve: Table performance improvements ([#1241](https://github.com/parse-community/parse-dashboard/pull/1241)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* Fix: Avoid filter tab disappears on apply filter ([#1229](https://github.com/parse-community/parse-dashboard/pull/1229)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* NEW: Change columns order and visibility ([#1235](https://github.com/parse-community/parse-dashboard/pull/1235)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* Improve: Table not scrolling when using arrow keys ([#1239](https://github.com/parse-community/parse-dashboard/pull/1239)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* NEW: Add masterkey parameters ([#1233](https://github.com/parse-community/parse-dashboard/pull/1233)), thanks to [Manuel](https://github.com/mtrezza)
* Improve: Editing values not possible on mobile ([#1222](https://github.com/parse-community/parse-dashboard/pull/1222)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* Fix: JSON conversion breaking file upload process ([#1225](https://github.com/parse-community/parse-dashboard/pull/1225)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* NEW: Support building on Windows ([#1115](https://github.com/parse-community/parse-dashboard/pull/1115)), thanks to [Diamond Lewis](https://github.com/dplewis)
* Improve: Avoid Parse transformations on array and object fields ([#1223](https://github.com/parse-community/parse-dashboard/pull/1223)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* NEW: Select all objects ([#1219](https://github.com/parse-community/parse-dashboard/pull/1219)), thanks to [Douglas Muaroka](https://github.com/douglasmuraoka)
* NEW: Boolean dropdown on installation condition ([#1221](https://github.com/parse-community/parse-dashboard/pull/1221)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* NEW: String editor resizable ([#1217](https://github.com/parse-community/parse-dashboard/pull/1217)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* Fix: Update PIG examples to work with react-dnd 3.x ([#1214](https://github.com/parse-community/parse-dashboard/pull/1214)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* Fix: Fonts on AppsIndex ([#1197](https://github.com/parse-community/parse-dashboard/pull/1197)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* NEW: Add required and default value options ([#1193](https://github.com/parse-community/parse-dashboard/pull/1193)), thanks to [Lucas Alencar](https://github.com/alencarlucas)

#### Breaking Changes:
* Parse Dashboard now requires Node.js version >= 8.9

### 1.4.3
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.4.2...1.4.3)
* Fix 1.4.2 release.

### 1.4.2
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.4.1...1.4.2)
* Feature: Include count CLP option ([#1180](https://github.com/parse-community/parse-dashboard/pull/1180)), thanks to [Douglas Muroaka](https://github.com/douglasmuraoka)
* Fix: AppsMenu broken layout when app name is too long ([#1164](https://github.com/parse-community/parse-dashboard/pull/1164)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* Fix: getFileName lib to display correctly the filename ([#1154](https://github.com/parse-community/parse-dashboard/pull/1154)), thanks to [Yago Tomé](https://github.com/yagotome)
* Fix: Scroll is not working properly ([#1151](https://github.com/parse-community/parse-dashboard/pull/1151)), thanks to [Lucas Alencar](https://github.com/alencarlucas)
* Fix: AppsMenu not closing after selecting app ([#1146](https://github.com/parse-community/parse-dashboard/pull/1146)), thanks to [Douglas Muroaka](https://github.com/douglasmuraoka)
* Feature: Add client key into GraphQL console by default ([#1142](https://github.com/parse-community/parse-dashboard/pull/1142)), thanks to [Douglas Muroaka](https://github.com/douglasmuraoka)
* Fix: GraphQL console headers menu not visible ([#1141](https://github.com/parse-community/parse-dashboard/pull/1141)), thanks to [Douglas Muroaka](https://github.com/douglasmuraoka)
* Fix: project not installing due to package-lock ([#1143](https://github.com/parse-community/parse-dashboard/pull/1143)), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)

### 1.4.1
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.4.0...1.4.1)
* Fix: 1.4.0 failed to deploy to npm.  Reset credentials and trying again.

### 1.4.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.3.3...1.4.0)
* Security Fix: see the [advisory](https://github.com/parse-community/parse-dashboard/network/alert/package-lock.json/lodash/open) for details. [22d748](https://github.com/parse-community/parse-dashboard/pull/1134/commits/22d748fdc1e95661dc39226f5f797dc8fb0e5c2f)
* Feature: GraphQL API playground ([#1123](https://github.com/parse-community/parse-dashboard/pull/1123)), thanks to [Douglas Muraoka](https://github.com/douglasmuraoka)
* Fix: Can't switch (dropdown list) between servers [#1045](https://github.com/parse-community/parse-dashboard/issues/1045) ([#1125](https://github.com/parse-community/parse-dashboard/pull/1125)), thanks to [Douglas Muraoka](https://github.com/douglasmuraoka)

### 1.3.3
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.3.2...1.3.3)

* FIX: Travis configuration which was preventing 1.3.2 from publishing, thanks to [Diamond Lewis](https://github.com/dplewis)

### 1.3.2
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.3.1...1.3.2)

* FIX: Dockerhub configuration which was preventing 1.3.1 from publishing ([#1098](https://github.com/parse-community/parse-dashboard/pull/1098)), thanks to [Diamond Lewis](https://github.com/dplewis)

### 1.3.1
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.3.0...1.3.1)

* FIX: Correct inappropriate error message when no target audience is selected ([#1052](https://github.com/parse-community/parse-dashboard/pull/1052)), thanks to [Bouimadaghene](https://github.com/starbassma)
* FIX: issue regarding lost mount path ([#1070](https://github.com/parse-community/parse-dashboard/pull/1070)), thanks to [Diamond Lewis](https://github.com/dplewis)
* NEW: Add distinct / unique filter ([#920](https://github.com/parse-community/parse-dashboard/pull/920)), thanks to [Diamond Lewis](https://github.com/dplewis)

### 1.3.0
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/1.2.0...1.3.0)

* Node 10 Support, thanks [Florent Vilmart](https://github.com/flovilmart)
* Fix: Remove column dialog default values (#969), thanks to [Jonas Stendahl](https://github.com/JStonevalley)
* Fix: Handle case of null in array (#922), thanks to [Abdullah Alsigar](https://github.com/agent3bood)
* Fix: JSON file upload (#935), thanks to [joshuadiezmo](https://github.com/joshuadiezmo)
* Fix: Set initial audience null (#910), thanks to [Paulo Reis](https://github.com/paulovitin)
* Fix: Ensure we traverse the payloadJSON properly (#861), thanks [Florent Vilmart](https://github.com/flovilmart)
* Improvements: Push Audiences (#813), thanks [Florent Vilmart](https://github.com/flovilmart)
* Improvements: Docker Build
* Feature: `preventSchemaEdits` option (#960), thanks to [Cyril Chandelier](https://github.com/cyrilchandelier)
* Feature: Redirect to the first app browser when only a single app is registered (#958), thanks to [Cyril Chandelier](https://github.com/cyrilchandelier)
* Feature: Add classname to browser title (#913), thanks to [Paulo Reis](https://github.com/paulovitin)
* Feature: Support for Clone Object (#946), thanks to [Diamond Lewis](https://github.com/dplewis)
* Feature: Add tvOS support to push targeting (#936), thanks to [Thomas Kollbach](https://github.com/toto)
* Feature: When using username to login, display dashboard username (#800), thanks to [Abdullah Alsigar](https://github.com/agent3bood)


### 1.2.0
* Fix: Filtering with a 1-digit number (#831), thanks to [Pascal Giguère](https://github.com/pgiguere1)
* Fix: Databrowser shows correct count of filtered objects, thanks to [Tom Engelbrecht](https://github.com/engel)
* Feature: Add primaryBackgroundColor and secondaryBackgroundColor in AppCard, thanks to [AreyouHappy](https://github.com/AreyouHappy)
* Improvement: Removes forcing sort on createdAt (#796), thanks to [Florent Vilmart](https://github.com/flovilmart)
* Fix: Broken Learn More link to cloud code documentation page (#828), thanks to [Stefan Trauth](https://github.com/funkenstrahlen)
* Fix: Add `_PushStatus` add to SpecialClasses (#701), thanks to [Dongwoo Gim](https://github.com/gimdongwoo)
* Fix: Include PushAudience query (#795), thanks to [marvelm](https://github.com/marvelm)

### 1.1.2

* Fix: An issue introduced when using readOnlyMasterKey would make all users readOnly after one has logged in.
* Reverts: Dependency updates that would render the build unstable / broken.

### 1.1.1

* Fix: Updating array of Dates now keeps it's type (was changing to array of ISO strings, issue #590), thanks to [David Riha](https://github.com/rihadavid)
* Fix: NaN displayed when filter input is empty or negative number (#749), thanks to [Miguel Serrrano](https://github.com/miguel-s)
* Fix: Addresses issue related to displaying iOS alert object containing title and body keys (#539), thanks to [Robert Martin del Campo](https://github.com/repertus)
* Feature: Adds support for localized push notifications if server version is high enough, thanks to [Florent Vilmart](https://github.com/flovilmart)
* Feature: Adds support for readOnly masterKey, thanks to [Florent Vilmart](https://github.com/flovilmart)
* Feature: Adds support for polygon types, thansk to [Mads Bjerre](https://github.com/madsb)
* Feature: Adds support for push time, expiration time, and expiration interval, thanks to [Marvel Mathew](https://github.com/marvelm)

### 1.1.0

* Feature: UI for managing push audiences (#712), thanks to [Davi Macedo](https://github.com/davimacedo)
* Feature: When editing Object or Array fields the data is displayed in a prettier format and the textarea is resizable (#734), thanks to [Samuli Siivinen](https://github.com/ssamuli)
* Fix: Display bug on safari when table has empty cells ('') (#731), thanks to [Samuli Siivinen](https://github.com/ssamuli)
* Fix: Added message that notifies Background Jobs requiring additional setup (#740 & #741), thanks to [Samuli Siivinen](https://github.com/ssamuli) and [Natan Rolnik](https://github.com/natanrolnik)

### 1.0.28
* Feature: Add ability to search Object columns (#727), thanks to [Samuli Siivinen](https://github.com/ssamuli)
* Improvement: Added/fixed a filtering option "contains string" for String fields. Case insensitive for now (#728), thanks to [Samuli Siivinen](https://github.com/ssamuli)
* Improvement: Sort config data according to parameter names (#726), thanks to [Natan Rolnik](https://github.com/natanrolnik)

### 1.0.27
* Improvement: Show notifications upon success or failure of save and delete objects (#718), thanks to [Natan Rolnik](https://github.com/natanrolnik)
* Improvement: Moves download option into file editor (#716), thanks to [Natan Rolnik](https://github.com/natanrolnik)

### 1.0.26
* Improvement: Fixes broken links, thanks to [Arthur Cinader](https://github.com/acinader)
* Improvement: Title on the add row button, thanks to [Abdul Basit](https://github.com/basitsattar)
* Improvement: Use slim docker image, thanks to [Tyler Brock](https://github.com/tbrock)
* Fix: table scrolling on google chrome (#671), thanks to [Jacer Omri](https://github.com/JacerOmri)
* Various: adds eslint, thanks to [Jeremy Louie](https://github.com/JeremyPlease)

### 1.0.25

* Improvement: Update and add links to sidebar footer (#661), thanks to [Natan Rolnik](https://github.com/natanrolnik)
* Fix: Don’t call unsupported endpoints in Parse Server (#660), thanks to [Natan Rolnik](https://github.com/natanrolnik)
* Fix: Display correctly Files and GeoPoints in Config (#666), thanks to [Natan Rolnik](https://github.com/natanrolnik)

### 1.0.24

* Improvement: Data browser updates object count when table is filtered (#652), thanks to [Mike Rizzo](https://github.com/rizzomichaelg)
* Improvement: Apps name sorting by name (#654), thanks to [Thilo Schmalfuß](https://github.com/scthi)
* Fix: Fetch jobs list not showing (#656), thanks to [Natan Rolnik](https://github.com/natanrolnik)

### 1.0.23

* Improvement: Enabling web hooks (#584), thanks to [Antonio Davi Macedo Coelho de Castro](https://github.com/davimacedo)
* Improvement: Set autofocus on the username input field (#644), thanks to [Herman Liang](https://github.com/hermanliang)
* Fix: Browser won't render class table with field that contains an object (#623), thanks to [Jordan Haven](https://github.com/jordanhaven)
* Fix: Config FETCH results in 401 (#575), thanks to [Matt Simms](https://github.com/brndmg)

### 1.0.22

* Fix issue affecting logging screen with encrypted passwords, thanks to [lsohn](https://github.com/lsohn)

### 1.0.21

* Fix: Use mountPath for all log in and log out redirects

### 1.0.20

* New: Form based login page instead of basic auth (#562), thanks to [Jeremy Louie](https://github.com/JeremyPlease)
* Fix: Can't send push to specific user (#570), thanks to [Dan VanWinkle](https://github.com/dvanwinkle)
* Fix: Download link in footer menu (#567), thanks to [Pavel Ivanov](https://github.com/pivanov)

### 1.0.19

* New: Support for trusting proxies w/ HTTPS
* New: Support for filtering string with `ends with`
* New: View parse-server based jobs
* New: Button to add rows from browser toolbar
* New: Support for encrypted passwords
* New: Support for sorting by `createdAt`
* Improvement: Push audiences support
* Fix: Calendar dates support

### 1.0.18

* Fix: Revert history change that was causing issues when mounting on express

### 1.0.17

* Fix: Revert mount path change that was causing issues when mounting on express

### 1.0.16

* New: Add options to add selected rows to a relation, thanks to [Han BaHwan](https://github.com/Beingbook)
* New: Add ability to use bcrypted passwords, thanks to [Dan VanWinkle](https://github.com/dvanwinkle)
* Fix: Fix deletion of columns, thanks to [Bryan Rhea](https://github.com/brheal)

### 1.0.15

* New: Add ability to delete all rows in a class, thanks to [Marco Cheung](https://github.com/Marco129)
* New: Add relation editor, thanks to [Han BaHwan](https://github.com/Beingbook)
* Fix: Bug when alert is missing in payload, thanks to [Herman Liang](https://github.com/hermanliang)
* Fix: Improve target display in Push viewer, thanks to [Herman Liang](https://github.com/hermanliang)
* Fix: Open docs and other sidebar links in new tab, thanks to [Konstantinos N.](https://github.com/kwstasna)

### 1.0.14

* Fix bug in past push page

### 1.0.13

* Fix log retrieval, thanks to [Jérémy Thiry](https://github.com/poltib)
* Improved GeoPoint editor and ESC button in editors, thanks to [Sam Schooler](https://github.com/samschooler)
* Add push status page to dashboard, thanks to [Jeremy Pease](https://github.com/JeremyPlease)

### 1.0.12

* Fix minor style issues
* Add pointer permissions editor
* Allow cancellation of edits in data browser using ESC key, thanks to [Manuel](https://github.com/mtrezza)
* Show error messages in the console when your app's icons can't be found, thanks to [Saif Al-Dilaimi](https://github.com/deada92)

### 1.0.11

* Add the ability to specify SSL cert and key, thanks to [Cory Imdieke](https://github.com/Vortec4800)
* Trust proxy when enabling --allowInsecureHTTP, thanks to [Andrew Chen](https://github.com/yongjhih)
* Fix App index when apps have an apostrophe in the name
* Fix display of prod/dev flag
* Support for Node 6

### 1.0.10

* Add the ability to specify icons for your app, thanks to [Natan Rolnik](https://github.com/natanrolnik)
* Fix sending push with JSON data

### 1.0.9

* Add the ability to mount the dashboard express app on a custom mount path, thanks to [hpello](https://github.com/hpello) with bugfixes from [mamaso](https://github.com/mamaso)
* Add ability to restrict certain users to certain apps, thanks to [Felipe Andrade](https://github.com/felipemobile)
* Fix Dockerfile, thanks to [Kakashi Liu](https://github.com/kkc)
* Display Parse Dashboard version, thanks to [Aayush Kapoor](https://github.com/xeoneux) and [gateway](https://github.com/gateway)
* Add a refresh button to the data browser, thanks to [TylerBrock](https://github.com/TylerBrock)
* Add logs viewer
* Misc. performance improvements and bugfixes, thanks to [Pavel Ivanov](https://github.com/pivanov)

### 1.0.8

* Allow Dashboard to be mounted as Express middleware, thanks to [Florent Vilmart](https://github.com/flovilmart)
* Add an option to specify that your app is in production, thanks to [Dylan Diamond](https://github.com/dcdspace)
* Fix GeoPoints in Parse Config, thanks to [Dylan Diamond](https://github.com/dcdspace)
* Allow specification of the host the dashboard runs on, thanks to [hpello](https://github.com/hpello)
* Miscellaneous look-and-feel improvements

### 1.0.7

* Fix sending pushes with badge increment

### 1.0.6

* Send push notifications from the dashboard
* Add object count to relation browser, thanks to [Sergey Gavrilyuk](https://github.com/gavrix)

### 1.0.5

* Fix new features notification

### 1.0.4

* Class level permissions editor
