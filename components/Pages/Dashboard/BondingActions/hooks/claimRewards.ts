import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const claimRewards = (
  signingClient: SigningCosmWasmClient,
  address: string,
  config: Config,
) => {
  const handleMsg = {
    claim: {},
  }
  return signingClient.execute(
    address,
    config.fee_distributor,
    handleMsg,
    'auto',
  )
}
