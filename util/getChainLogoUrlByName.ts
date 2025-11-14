import { WalletChainName } from 'constants/index'

export const getChainLogoUrlByName = (chainName: string) : string => {
  switch (chainName) {
    case WalletChainName.migaloo:
      return '/logos/migaloo.png'
    case WalletChainName.terrac:
      return '/logos/lunac.png'
    case WalletChainName.injective:
      return '/logos/injective.png'
    case WalletChainName.terra:
      return '/logos/terra.png'
    case WalletChainName.osmosis:
      return '/logos/osmo.svg'
    default:
      return null
  }
}
