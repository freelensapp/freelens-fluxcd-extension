# @freelensapp/fluxcd-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/freelensapp/freelens?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/freelensapp/freelens)
[![Release](https://img.shields.io/github/v/release/freelensapp/freelens-fluxcd-extension?display_name=tag&sort=semver)](https://github.com/freelensapp/freelens-fluxcd-extension)
[![Integration tests](https://github.com/freelensapp/freelens-fluxcd-extension/actions/workflows/integration-tests.yaml/badge.svg?branch=main)](https://github.com/freelensapp/freelens-fluxcd-extension/actions/workflows/integration-tests.yaml)
[![npm](https://img.shields.io/npm/v/@freelensapp/fluxcd-extension.svg)](https://www.npmjs.com/package/@freelensapp/fluxcd-extension)

<!-- markdownlint-enable MD013 -->

This extension integrates FluxCD support into
[Freelens](https://github.com/freelensapp/freelens).
[FluxCD](https://fluxcd.io/) v2.0.0 or higher is supported.

Features include:

- Comprehensive dashboard for FluxCD Application components and Events.
- Resource menus for reconciling, syncing, and automating FluxCD resources.
- Detailed views of FluxCD resource information.

## Screenshots

### Dashboard
![./docs/images/dashboard.png](./docs/images/dashboard.png)

## Requirements

- Kubernetes >= 1.24
- Freelens >= 1.3.1
- Flux >= v2.0.0
- kustomize-controller >= v0.1.0
- helm-controller >= v0.1.0

## API supported

- [helm.toolkit.fluxcd.io/v2beta1](https://github.com/fluxcd/helm-controller/blob/main/docs/spec/v2beta1/helmreleases.md)
- [kustomize.toolkit.fluxcd.io/v1beta1](https://github.com/fluxcd/kustomize-controller/blob/v1.6.0/docs/spec/v1beta1/kustomizations.md)

## Install

To install or upgrade: open Freelens and go to Extensions (`ctrl`+`shift`+`E`
or `cmd`+`shift`+`E`), and install `@freelensapp/extension-fluxcd`.

or:

Use a following URL in the browser:
[freelens://app/extensions/install/%40freelensapp%2Fextension-fluxcd](freelens://app/extensions/install/%40freelensapp%2Fextension-fluxcd)

## Build from the source

You can build the extension using this repository.

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm) or
[mise-en-place](https://mise.jdx.dev/) or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
required Node.js version.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install 22.15.1
nvm use 22.15.1
```

Install Pnpm:

```sh
corepack install
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
# or
winget install pnpm.pnpm
```

### Build extension

```sh
pnpm i
pnpm build
pnpm pack
```

### Install built extension

The tarball for the extension will be placed in the current directory. In
Freelens, navigate to the Extensions list and provide the path to the tarball
to be loaded, or drag and drop the extension tarball into the Freelens window.
After loading for a moment, the extension should appear in the list of enabled
extensions.

## License

Copyright (c) 2025 Freelens Authors.

[MIT License](https://opensource.org/licenses/MIT)

Based on:

- <https://github.com/appvia/lens-fluxcd-extension>
- <https://github.com/okaufmann/lens-fluxcd-extension>
