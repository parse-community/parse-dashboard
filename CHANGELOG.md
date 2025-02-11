# Changelog

Changelogs are separated by release type for better overview.

## ✅ [Stable Releases][log_release]

These are the official, stable releases that you can use in your production environments.

> ### "Stable for production!"

Details:
- Stability: *stable*
- NPM channel: `@latest`
- Branch: [release][branch_release]
- Purpose: official release
- Suitable environment: production

## ⚠️ [Beta Releases][log_beta]

These are releases that are pretty stable, but may have still some bugs to be fixed before official release.

> ### "Please try out, we'd love your feedback!"

Details:
- Stability: *pretty stable*
- NPM channel: `@beta`
- Branch: [beta][branch_beta]
- Purpose: feature maturation
- Suitable environment: development

## 🔥 [Alpha Releases][log_alpha]

> ### "If you are curious to see what's next!"

These releases contain the latest development changes, but you should be prepared for anything, including sudden breaking changes or code refactoring. Use this branch to contribute to the project and open pull requests.

Details:
- Stability: *unstable*
- NPM channel: `@alpha`
- Branch: [alpha][branch_alpha]
- Purpose: product development
- Suitable environment: experimental

## [Unreleased]
### Added
- Keyboard shortcut: Space key to select/unselect rows in data browser
  - Users can now use arrow keys to navigate rows and press space to toggle row selection
  - Works in combination with existing features like info panel and batch operations
  - Improves efficiency when reviewing and selecting multiple rows

[log_release]: https://github.com/parse-community/parse-dashboard/blob/release/changelogs/CHANGELOG_release.md
[log_beta]: https://github.com/parse-community/parse-dashboard/blob/beta/changelogs/CHANGELOG_beta.md
[log_alpha]: https://github.com/parse-community/parse-dashboard/blob/alpha/changelogs/CHANGELOG_alpha.md
[branch_release]: https://github.com/parse-community/parse-dashboard/tree/release
[branch_beta]: https://github.com/parse-community/parse-dashboard/tree/beta
[branch_alpha]: https://github.com/parse-community/parse-dashboard/tree/alpha
