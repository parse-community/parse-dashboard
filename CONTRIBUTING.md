# Contributing to Parse Dashboard
We want to make contributing to this project as easy and transparent as
possible.

## Our Development Process
Get started by cloning this repository and and running `npm install` inside it. Create a file called `parse-dashboad-config.json` in the Parse-Dashboard folder inside the repo, using the format described in the readme.

When working on the dashboard, use `npm run dashboard` and visit `localhost:4040` to see your dashboard. The `npm run dashboard` script will automatically re-build your files when you change them, so after making a change, all you need to do is refresh the page.

When working on React components, use `npm run pig` and visit `localhost:4041` to view our component library and documentation (you can have both Dashboard and PIG running at once). The demos for each component are the primary way we test components, although there are also a small number of automated tests you can run with `npm test`. If you would like to create a new component that does not exist in the component library, use `npm run generate yourComponentName` to generate boilerplate code and quickly get started.

## Pull Requests
We actively welcome your pull requests.

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. If you've updated/added an UI component, please add a screenshot.
5. Ensure the test suite passes.
6. If you haven't already, complete the Contributor License Agreement ("CLA").

## Contributor License Agreement ("CLA")
In order to accept your pull request, we need you to submit a CLA. You only need
to do this once to work on any of Facebook's open source projects.

Complete your CLA here: <https://code.facebook.com/cla>

## Issues
We use GitHub issues to track public bugs. Please ensure your description is
clear and has sufficient instructions to be able to reproduce the issue.

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe
disclosure of security bugs. In those cases, please go through the process
outlined on that page and do not file a public issue.

## License
By contributing to Parse Dashboard, you agree that your contributions will be licensed
under its license.
