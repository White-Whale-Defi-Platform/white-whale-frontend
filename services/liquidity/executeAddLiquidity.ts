import { TokenInfo } from 'queries/usePoolsListQuery'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { TerraTreasuryService } from 'services/treasuryService'
import { Wallet } from 'util/wallet-adapters'

type ExecuteAddLiquidityArgs = {
  tokenA: TokenInfo
  tokenB: TokenInfo
  tokenAAmount: string
  tokenBAmount: string
  /*
   * The contract calculates `tokenBAmount` automatically.
   * However, the user needs to set max amount of `tokenB` they're willing to spend.
   * If the calculated amount exceeds the max amount, the transaction then fails.
   */
  senderAddress: string
  swapAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
  chainId?: string
}

export const executeAddLiquidity = async ({
tokenA,
tokenB,
tokenAAmount,
tokenBAmount,
signingClient,
senderAddress,
msgs,
chainId,
}: ExecuteAddLiquidityArgs): Promise<any> => {
let fee = null
  if (chainId === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFeeForDeposit(
      tokenAAmount, tokenA.denom, tokenBAmount, tokenB.denom,
    )
  }
  await signingClient.signAndBroadcast(senderAddress, msgs, 'auto', fee)
}
