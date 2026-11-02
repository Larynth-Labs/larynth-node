# Contributing

The client under `src/generated` is generated from `openapi/openapi.json` (run `npm run generate`), and that spec is synced from the Larynth core on every API change. Changes to generated files or the spec are overwritten on the next sync, so they are not accepted here. Open an issue describing the API or generator problem instead.

Welcome as pull requests: documentation, README examples, CI and packaging fixes, and tests that do not touch generated code.

Before opening a pull request run: `npm ci && npm run typecheck && npm test && npm run build`

By contributing you agree that your work is released under the MIT license in this repository. Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report security issues as described in [SECURITY.md](SECURITY.md).
