# Changelog

All notable changes to this package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

- Regenerated the client from the current public API spec. It adds the alerts, analytics, issues, practice, call texts and knowledge-gap draft operations and the types that go with them.
- Webhook event types now include every event the API accepts.
- Breaking: the spam allow list is paginated; ListSpamAllow is now PageSpamAllow.
- Regenerated the client from the current public API spec. It adds the greeting audio operations (upload, remove and play a recorded greeting), the builder presets and price estimate catalog operations, and the types that go with them. Catalog models now carry `retires_on`, `latency_p95_ms`, `latency_samples`, `latency_source` and `latency_measured_at`, and `latency_basis` is `live` or `lab`.

## [0.1.0]

- Initial public release.
