# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.3](https://github.com/soc221b/zod-schema-faker/compare/1.0.2...v1.0.3) (2024-08-17)


### Bug Fixes

* readonly fake data should be freezed ([#211](https://github.com/soc221b/zod-schema-faker/issues/211)) ([0bab5a7](https://github.com/soc221b/zod-schema-faker/commit/0bab5a7272a181c14bcd82dae33a66b1de2c2e98))

## [1.0.2](https://github.com/soc221b/zod-schema-faker/compare/1.0.1...v1.0.2) (2024-08-16)


### Bug Fixes

* it should return `undefined` when fake z.void ([#203](https://github.com/soc221b/zod-schema-faker/issues/203)) ([ded1efa](https://github.com/soc221b/zod-schema-faker/commit/ded1efa5890753cc05c831f719f456149424179b))
* it should throws an error when fake z.never ([#201](https://github.com/soc221b/zod-schema-faker/issues/201)) ([d4e9652](https://github.com/soc221b/zod-schema-faker/commit/d4e9652540a4468915d8abf009f27e34c5e3b54a))


### Performance Improvements

* enable isolated declarations ([#197](https://github.com/soc221b/zod-schema-faker/issues/197)) ([2425c04](https://github.com/soc221b/zod-schema-faker/commit/2425c042c8c91114f931c11b21fd37f53ff5d102))

## [1.0.1](https://github.com/soc221b/zod-schema-faker/compare/1.0.0...v1.0.1) (2024-08-10)


### Bug Fixes

* [#189](https://github.com/soc221b/zod-schema-faker/issues/189) ([b8d1622](https://github.com/soc221b/zod-schema-faker/commit/b8d162244d4ffee29d0c0744ed1d0299b78c0978))
* unable to resolve exported members ([#193](https://github.com/soc221b/zod-schema-faker/issues/193)) ([b8d1622](https://github.com/soc221b/zod-schema-faker/commit/b8d162244d4ffee29d0c0744ed1d0299b78c0978)), closes [#189](https://github.com/soc221b/zod-schema-faker/issues/189)

## [1.0.0](https://github.com/soc221b/zod-schema-faker/compare/0.2.0...v1.0.0) (2024-06-30)


### ⚠ BREAKING CHANGES

* migrate to vite ([#152](https://github.com/soc221b/zod-schema-faker/issues/152))

### Features

* emoji ([21d7d1d](https://github.com/soc221b/zod-schema-faker/commit/21d7d1d72fae31be7d49f20fcdc7480044f15101))
* throw better errors ([#161](https://github.com/soc221b/zod-schema-faker/issues/161)) ([4d9c1de](https://github.com/soc221b/zod-schema-faker/commit/4d9c1de9da76eafda2b1551746b45d84c5100900))


### Bug Fixes

* **deps:** update dependency zod to v3.23.3 ([#131](https://github.com/soc221b/zod-schema-faker/issues/131)) ([5b7139b](https://github.com/soc221b/zod-schema-faker/commit/5b7139b86229d27959f3fe247f52d5f96f271fa9))
* **deps:** update dependency zod to v3.23.4 ([#134](https://github.com/soc221b/zod-schema-faker/issues/134)) ([b40e515](https://github.com/soc221b/zod-schema-faker/commit/b40e5150fc3f3ddd130ab84534d7db75e08fd3f1))
* **deps:** update dependency zod to v3.23.5 ([#138](https://github.com/soc221b/zod-schema-faker/issues/138)) ([fc29e6c](https://github.com/soc221b/zod-schema-faker/commit/fc29e6c816101db2d5d9282f051c3e71e66440dc))
* **deps:** update dependency zod to v3.23.6 ([#142](https://github.com/soc221b/zod-schema-faker/issues/142)) ([2e0c115](https://github.com/soc221b/zod-schema-faker/commit/2e0c115dc851c0ce7a9a4482eae3426dfa313809))
* **deps:** update dependency zod to v3.23.7 ([#144](https://github.com/soc221b/zod-schema-faker/issues/144)) ([22d2f4a](https://github.com/soc221b/zod-schema-faker/commit/22d2f4a665665abdd2e3d392a51cd96ea4fa448d))
* **deps:** update dependency zod to v3.23.8 ([#146](https://github.com/soc221b/zod-schema-faker/issues/146)) ([c29a173](https://github.com/soc221b/zod-schema-faker/commit/c29a173e941a4e8013714f97a6a01231e576f085))
* emoji ([f1717aa](https://github.com/soc221b/zod-schema-faker/commit/f1717aa2ee1c48026642d16a3587fa44f606fd4e))
* uninstall custom fakers too ([#162](https://github.com/soc221b/zod-schema-faker/issues/162)) ([56c16ae](https://github.com/soc221b/zod-schema-faker/commit/56c16aec4eef32cccd2a9063e16c6e417654c585))


### Build System

* migrate to vite ([#152](https://github.com/soc221b/zod-schema-faker/issues/152)) ([afdeb6d](https://github.com/soc221b/zod-schema-faker/commit/afdeb6d3bebd6ae990da4723acf69a0e375234e2))

## [0.2.0](https://github.com/iendeavor/zod-schema-faker/compare/v0.1.3...v0.2.0) (2024-04-22)


### ⚠ BREAKING CHANGES

* use deps instead peer deps since there is no test for each versions

### Features

* bigint ([2fd3f74](https://github.com/iendeavor/zod-schema-faker/commit/2fd3f7473610f228bd3418b3ce12987e3de6454b))
* custom ([1bf4bff](https://github.com/iendeavor/zod-schema-faker/commit/1bf4bffd243500b4c8869ae67b2d5ed0753a0c02))
* date ([6b4b33a](https://github.com/iendeavor/zod-schema-faker/commit/6b4b33ad32375bb2ab5d9b75e722267787d6d63e))
* discriminated union ([e3ceca7](https://github.com/iendeavor/zod-schema-faker/commit/e3ceca731521e433bd3d7f9eaaf54d1bba77be57))
* function ([a83b69d](https://github.com/iendeavor/zod-schema-faker/commit/a83b69d26219f07499ab7f98e576eb749449bcd0))
* number ([a945989](https://github.com/iendeavor/zod-schema-faker/commit/a945989248d3ccc803ca563d62fce6980ea16efc))
* number multipleOf ([d2375a9](https://github.com/iendeavor/zod-schema-faker/commit/d2375a9b1150fde50c688e20d30db3018d0cdf14))
* pipe ([fbfdec9](https://github.com/iendeavor/zod-schema-faker/commit/fbfdec9862c7cb80851bb7f88ec2a50b55e361e6))
* reaonly ([f3d7f82](https://github.com/iendeavor/zod-schema-faker/commit/f3d7f8288926d08d0ed7730e3bb29bd2b839cde2))
* string ([66144db](https://github.com/iendeavor/zod-schema-faker/commit/66144dbc3bbc3678a17b9f5487b703e71828a5a4))
* string ([00977d5](https://github.com/iendeavor/zod-schema-faker/commit/00977d58b24302b6b26fc256543175d41911b663))
* throw error for unimplemented kinds ([b115b4a](https://github.com/iendeavor/zod-schema-faker/commit/b115b4a71b652ea2e80cdf59f5aeae962be311d7))


### Bug Fixes

* array ([f7a2315](https://github.com/iendeavor/zod-schema-faker/commit/f7a2315a6c1b3ea972a94cbdecad09721e0dd62a))
* **deps:** update dependency zod to v3.22.3 [security] ([#116](https://github.com/iendeavor/zod-schema-faker/issues/116)) ([2986348](https://github.com/iendeavor/zod-schema-faker/commit/298634893b9e0a2911a976de0f9773ca04d4f35f))
* **deps:** update dependency zod to v3.22.5 ([#117](https://github.com/iendeavor/zod-schema-faker/issues/117)) ([a0ce6f3](https://github.com/iendeavor/zod-schema-faker/commit/a0ce6f322b9e26cad8a5898337e8a0818f18937c))
* **deps:** update dependency zod to v3.23.0 ([#125](https://github.com/iendeavor/zod-schema-faker/issues/125)) ([1697faf](https://github.com/iendeavor/zod-schema-faker/commit/1697faf51035bd1c7c36ebc106a5ba1e3282737a))
* effect ([4378f2f](https://github.com/iendeavor/zod-schema-faker/commit/4378f2fe41cbd03364058cdf790813af061277a9))
* function ([19f68bc](https://github.com/iendeavor/zod-schema-faker/commit/19f68bcb570017c2918c12a50fc271dd241531fb))
* intersection left and right may not have same length ([9a3a9f6](https://github.com/iendeavor/zod-schema-faker/commit/9a3a9f6bed95ee46737b520ad9da68d352f7a54e))
* it should return one of dates for intersections ([fde5c1d](https://github.com/iendeavor/zod-schema-faker/commit/fde5c1d5477850f045cb14da5ed2cb7bef612c74))
* string ([2b3e7fc](https://github.com/iendeavor/zod-schema-faker/commit/2b3e7fc8c880d69aaf6c57be413c1eb4d63e2daa))


### build

* use deps instead peer deps since there is no test for each versions ([f33ace0](https://github.com/iendeavor/zod-schema-faker/commit/f33ace0060db5d782473d67c577b4a1d8c5c8e1f))

### 0.1.6 (2023-01-25)

### 0.1.5 (2023-01-18)

### 0.1.4 (2022-12-21)

### 0.1.3 (2022-12-07)

### [0.1.2](https://github.com/iendeavor/zod-schema-faker/compare/v0.1.1...v0.1.2) (2022-04-09)


### Features

* add API descriptions ([4731f8b](https://github.com/iendeavor/zod-schema-faker/commit/4731f8bea78dc201e125fd66453523e38e37897b))
* add seed API ([38e84b5](https://github.com/iendeavor/zod-schema-faker/commit/38e84b560905e848fd6653890ad1b5ca47280a26))
* generate random values of random schemas for any schema ([c3f5ffc](https://github.com/iendeavor/zod-schema-faker/commit/c3f5ffc434b47ecc05203cc8560ec368cabeb20a))
* generate random values of random schemas for unknown schema ([75e61ff](https://github.com/iendeavor/zod-schema-faker/commit/75e61ffaf0967cec990b7b11678496e8cd459f01))
* remove faker, customization is not supported yet ([1e3a48d](https://github.com/iendeavor/zod-schema-faker/commit/1e3a48d4bbfe861c7b9726e30cf3ed4ac35d48a0))
* remove internal API ([514a4c8](https://github.com/iendeavor/zod-schema-faker/commit/514a4c8c4a3561de025a479a7a3cee8ad1d53996))
* return random Date instead of now ([2cf1a9f](https://github.com/iendeavor/zod-schema-faker/commit/2cf1a9f2629b167df98323c57a9905e77adc4ad0))


### Bug Fixes

* never type should not be used ([14934ac](https://github.com/iendeavor/zod-schema-faker/commit/14934ac2e7ef249ade6845392db927987ace9e2e))
* seed not works as expected ([4bc4b12](https://github.com/iendeavor/zod-schema-faker/commit/4bc4b128dce34d6581bc387ea1f1107e7ed74fb6))
* void type could be any value ([f3770c4](https://github.com/iendeavor/zod-schema-faker/commit/f3770c4a22bcb525551d9428d1189558d02f95d1))

### [0.1.1](https://github.com/iendeavor/zod-schema-faker/compare/v0.1.0...v0.1.1) (2022-04-08)

## 0.1.0 (2022-04-08)


### Features

* init ([9fc0d1b](https://github.com/iendeavor/zod-schema-faker/commit/9fc0d1bcd67e06c64e567b641cff43fa33ad1eb9))
