import { useEffect } from 'react'
import { useMutation } from 'react-query'

import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { useRecoilState, useRecoilValue } from 'recoil'

import {
  ibcWalletState,
  walletState,
  WalletStatusType,
} from '../state/atoms/walletAtoms'
import { clearWalletState } from '../util/cleatWalletState'
import { GAS_PRICE } from '../util/constants'
import { useIBCAssetInfo } from './useIBCAssetInfo'

/* shares very similar logic with `useConnectWallet` and is a subject to refactor */
export const useConnectIBCWallet = (
  tokenSymbol: string,
  mutationOptions?: Parameters<typeof useMutation>[2]
) => {
  const [{ status, tokenSymbol: storedTokenSymbol }, setWalletState] =
    useRecoilState(ibcWalletState)
  const { activeWallet } = useRecoilValue(walletState)

  const assetInfo = useIBCAssetInfo(tokenSymbol || storedTokenSymbol)

  const mutation = useMutation(async () => {
    if (window && !window?.[activeWallet]) {
      clearWalletState(activeWallet)
      return
    }

    if (!tokenSymbol && !storedTokenSymbol) {
      throw new Error(
        'You must provide `tokenSymbol` before connecting to the wallet.'
      )
    }

    if (!assetInfo) {
      throw new Error(
        'Asset info for the provided `tokenSymbol` was not found. Check your internet connection.'
      )
    }

    /* set the fetching state */
    setWalletState((value) => ({
      ...value,
      tokenSymbol,
      client: null,
      state: WalletStatusType.connecting,
    }))

    try {
      const { chain_id, rpc } = assetInfo

      await window[activeWallet].enable(chain_id)
      const offlineSigner = await window[activeWallet].getOfflineSignerAuto(
        chain_id
      )

      const wasmChainClient = await SigningStargateClient.connectWithSigner(
        rpc,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(GAS_PRICE),
        }
      )

      const [{ address }] = await offlineSigner.getAccounts()

      /* successfully update the wallet state */
      setWalletState({
        tokenSymbol,
        address,
        client: wasmChainClient,
        status: WalletStatusType.connected,
      })
    } catch (e) {
      /* set the error state */
      setWalletState({
        tokenSymbol: null,
        address: '',
        client: null,
        status: WalletStatusType.error,
      })

      throw e
    }
  }, mutationOptions)

  const connectWallet = mutation.mutate

  useEffect(() => {
    /* restore wallet connection */
    if (status === WalletStatusType.restored && assetInfo) {
      connectWallet(null)
    }
  }, [status, connectWallet, assetInfo])

  useEffect(() => {
    function reconnectWallet() {
      if (assetInfo && status === WalletStatusType.connected) {
        connectWallet(null)
      }
    }

    window.addEventListener('keplr_keystorechange', reconnectWallet)
    return () => {
      window.removeEventListener('keplr_keystorechange', reconnectWallet)
    }
  }, [connectWallet, status, assetInfo])

  return mutation
}
