import { WalletChainName } from 'constants/index'

export const getChainLogoUrlByName = (chainName: string) : string => {
  switch (chainName) {
    case WalletChainName.migaloo:
      return '/logos/migaloo.png'
    case WalletChainName.terrac:
      return '/logos/lunac.png'
    case WalletChainName.chihuahua:
      return '/logos/huahua.png'
    case WalletChainName.comdex:
      return '/logos/comdex.png'
    case WalletChainName.injective:
      return '/logos/injective.png'
    case WalletChainName.sei:
      return '/logos/sei.svg'
    case WalletChainName.juno:
      return '/logos/juno.svg'
    case WalletChainName.terra:
      return '/logos/terra.png'
    case WalletChainName.osmosis:
      return '/logos/osmo.svg'
    case WalletChainName.archway:
      return 'https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg'
    default:
      return null
  }
}
