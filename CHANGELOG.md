## Parse Dashboard Changelog

### master
[Full Changelog](https://github.com/parse-community/parse-dashboard/compare/2.1.0...master)

__New features:__
* Added data export in CSV format ([#1494](https://github.com/parse-community/parse-dashboard/pull/1494)), thanks to [Cory Imdieke](https://github.com/Vortec4800).

### 2.1.0
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
