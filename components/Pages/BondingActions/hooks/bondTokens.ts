import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { TerraTreasuryService } from 'services/treasuryService'

export const bondTokens = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  amount: number,
  denom: string,
  config: Config,
  chainId?: string,
) => {
  const handleMsg = {
    bond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom,
          },
        },
      },
    },
  }

  let fee = 'auto'
  if (await signingClient.getChainId() === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(amount, denom)
  }
  return signingClient.execute(
    address, config.whale_lair, handleMsg, fee ,'',[coin(amount, denom)]
  )
}
