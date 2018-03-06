## Parse Dashboard Changelog

### NEXT RELEASE

* _Contributing to this repo? Add info about your change here to be included in next release_

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
