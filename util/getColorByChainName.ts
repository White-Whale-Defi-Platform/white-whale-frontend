import { WalletChainName } from 'constants/index'

export const getColorByChainName = (chainName: string) : string => {
  switch (chainName) {
    case WalletChainName.migaloo:
      return '#008000'
    case WalletChainName.terrac:
      return '#FFD700'
    case WalletChainName.chihuahua:
      return '#FFFACD'
    case WalletChainName.comdex:
      return '#98FB98'
    case WalletChainName.injective:
      return '#ADD8E6'
    case WalletChainName.sei:
      return '#20B2AA'
    case WalletChainName.juno:
      return '#40E0D0'
    case WalletChainName.terra:
      return '#00FF00'
    case WalletChainName.osmosis:
      return '#800080'
    // TODO: ARCHWAY
    case WalletChainName.archway:
      return '#000000'

    default:
      return null
  }
}
