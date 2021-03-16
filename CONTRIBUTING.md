# CONTRIBUTING.md

Actually a memo for myself

### Development

Author code on `dev` branch

Merge the `dev` into `release` once you bump the version

### Deploy

Pushing to `release` automatically deploys

See `deploy-release` job on CircleCI

### Nightly builds

It automatically builds and deploys the HEAD of the `dev` branch

See `nightly` workflow on CircleCI
