<a href="https://whitewhale.money/">
  <h1 align="center">
    <picture>
      <img alt="Flutter" src="https://miro.medium.com/max/1400/1*29OYRJqqddosWtWo-c3TYQ.png">
    </picture>
  </h1>
</a>

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![first-timers-only](https://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square)](https://www.firsttimersonly.com/)
[![Discord badge][]][Discord invite]
[![Twitter handle][]][Twitter badge]
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/6401/badge)](https://bestpractices.coreinfrastructure.org/projects/6401)


[Discord invite]: https://discord.com/invite/tSxyyCWgYX
[Discord badge]: https://img.shields.io/discord/908044702794801233
[Twitter handle]: https://img.shields.io/twitter/follow/WhiteWhaleDefi.svg?style=social&label=Follow
[Twitter badge]: https://twitter.com/intent/follow?screen_name=WhiteWhaleDefi
## White Whale Migaloo Cross-Chain Frontend

An open-source interface for multiple CosmWasm decentralized exchanges across chains.
Additionally there are Pools and Flashloan enabled Vaults deployed on each chain as part of the White Whale's Liquidity Platform. 

The interface is general in the sense that multiple Cosmos-SDK chains can be swapped to and from with all the details coming from config files. This serves as an allowlist of pools, vaults and any other contract.

The app was originally based on the Wasmswap frontend and rebuilt from there.


## Resources

1. [Website](https://whitewhale.money/)
2. [LitePaper](https://whitewhale.money/LitepaperV2.pdf)
3. [Docs](https://white-whale-defi-platform.github.io/docs/)
4. [Discord](https://discord.com/invite/tSxyyCWgYX)
5. [Twitter](https://twitter.com/WhiteWhaleDefi)
6. [Telegram](https://t.me/whitewhaleofficial)


## Quickstart

Run the app in dev mode locally.

```bash
npm run dev
# or
yarn dev
```

Access the app on `http://localhost:3000/`.

## Contributing

[Contributing Guide](./docs/CONTRIBUTING.md)

[Code of Conduct](./docs/CODE_OF_CONDUCT)

[Security Policies and Procedures](./docs/SECURITY)

[License](./LICENSE)

## Netlify Integration

In order to ensure successful deploys to Netlify via the CI/CD process, ensure the `yarn build` command is passing locally before a push, any failures here will fail the deploy too.

## Configuration

The app configuration, feature flags, etc., is located in the .env config file.

To configure the app, you will need to swap the demo example configuration set with your chain information and add your tokens and ibc assets information.

### Chain configuration

Swap our test chain info example with your configuration to suggest your chain for Keplr and allow the wallet to be used in the app. It expects to receive data in the `ChainInfo` format. Refer to [Keplr documentation](https://docs.keplr.app/api/suggest-chain.html) for more information.

> Keplr's 'suggest chain' feature allows front-ends to add new Cosmos-SDK based blockchains that are not natively supported.

Use this `env` variable to update the chain info path. The app will dynamically load the configuration so that the path can point to a local file in `/public` or a url.

```
Local

NEXT_PUBLIC_CHAIN_INFO_URL=/chain_info.testnet.json
```

```
Url

NEXT_PUBLIC_CHAIN_INFO_URL=https://raw.githubusercontent.com/Wasmswap/asset-list-example/main/chain_info.json
```



## Branding configuration

### Branding

We rcommend vector graphics for your project's logo and name. Go to `/icons/Logo.tsx` and swap our branded logo symbol with yours to update the app logo.

Go to `/icons/LogoText.tsx` and update the file accordingly to update the logo text.

### Color palette

To update the color palette, go to `components/theme.ts` and provide your custom values.

### Typography and buttons

#### Font

To swap the font, navigate to `components/theme.ts` and update the font family tokens. Don't forget to connect your fonts. Refer to `styles/globals.scss` for an example.

#### Color palette

Update your project colors in the same file by updating the color tokens, and values for `textColors`, `iconColors`, `backgroundColors`, `borderColors`. It's important to keep color tokens in one space as we're planning on supporting dark & sepia modes in the future.

#### Buttons

To update the styling for buttons go to `components/Button.tsx` and provide your custom styling for the variants we use.

#### Typography

To update the typography component configuration, go to `components/Text.tsx` and provide your custom styling for our variants.

## How to deploy

This is a nextjs app; thus everything that a nextjs app supports for deployment technically is supported by `migaloo-frontend`. We would recommend looking into Vercel.

## Contributing

Raise the bar for Web 3.0 with us! We would love you to contribute. Submit your PR contributions and issues directly on this repo.

## License

Migaloo-frontend interface is licensed under Apache 2.0.
