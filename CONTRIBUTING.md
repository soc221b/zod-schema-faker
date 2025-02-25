# Contributing

## Open Development

All work on Zod-schema-faker happens directly on GitHub.

## Semantic Versioning

Zod-schema-faker follows [semantic versioning](https://semver.org/). We release patch versions for critical bugfixes,
minor versions for new features or non-essential changes, and major versions for any breaking changes. When we make
breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming
changes and migrate their code in advance.

Every significant change is documented in the
[changelog file](https://github.com/soc221b/zod-schema-faker/blob/main/CHANGELOG.md).

## Branch Organization

Submit all changes directly to the [main branch](https://github.com/soc221b/zod-schema-faker/tree/main). We don’t use
separate branches for development or for upcoming releases. We do our best to keep `main` in good shape, with all tests
passing.

Code that lands in `main` must be compatible with the latest stable release. It may contain additional features, but no
breaking changes. We should be able to release a new minor version from the tip of `main` at any time.

## Bugs

### Where to Find Known Issues

We are using [GitHub Issues](https://github.com/soc221b/zod-schema-faker/issues) for our public bugs. We keep a close
eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make
sure your problem doesn’t already exist.

### Reporting New Issues

The best way to get your bug fixed is to provide a reduced test case. This
[StackBlitz template](https://stackblitz.com/edit/zod-schema-faker?file=src%2Fmain.ts) is a great starting point.

## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend
[filing an issue](https://github.com/soc221b/zod-schema-faker/issues/new). This lets us reach an agreement on your
proposal before you put significant effort into it.

If you’re only fixing a bug, it’s fine to submit a pull request right away but we still recommend to file an issue
detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the
issue.

## Sending a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to
it, or close it with an explanation. We’ll do our best to provide updates and feedback throughout the process.

**Before submitting a pull request, please make sure the following is done:**

1. Fork [the repository](https://github.com/soc221b/zod-schema-faker) and create your branch from `main`.
2. Run `npm ci` in the repository root.
3. If you’ve fixed a bug or added code that should be tested, add tests!
4. Ensure the test suite passes (`npm run test`).
5. Format your code (`npm run format`).

## Contribution Prerequisites

- You have Node installed at LTS.
- You are familiar with Git.

## Development Workflow

After cloning Zod-schema-faker, run `npm ci` to fetch its dependencies. Then, you can run several commands:

- `npm run build` builds the library.
- `npm run format` checks the code style.
- `npm run test` runs the test suite.

## Style Guide

We use an automatic code formatter called [Prettier](https://prettier.io/). Run `npm run format` after making any
changes to the code.

## License

By contributing to Zod-schema-faker, you agree that your contributions will be licensed under its MIT license.
