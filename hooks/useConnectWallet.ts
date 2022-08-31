import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'
import { useEffect } from 'react'
import { useMutation } from 'react-query'
import { useRecoilState } from 'recoil'
// import { useRecoilValue } from 'recoil'
// import { activeChain } from 'state/atoms/activeChain';

import { walletState, WalletStatusType } from '../state/atoms/walletAtoms'
import { GAS_PRICE } from '../util/constants'
import { useChainInfo, useChains } from './useChainInfo'
import { useToast } from '@chakra-ui/react'
// import chains from "components/Wallet/chainInfo.json"


export const useConnectWallet = (
  mutationOptions?: Parameters<typeof useMutation>[2]
) => {
  // const selctedChain = useRecoilValue(activeChain)
  const [{ status, chainId }, setWalletState] = useRecoilState(walletState)
  const toast = useToast()

  let [chainInfo] = useChainInfo(chainId)
  const chains = useChains()


  const mutation = useMutation(async (id = chainId) => {
    if (window && !window?.keplr) {
      alert('Please install Keplr extension and refresh the page.')
      return
    }
    // if (id)
    chainInfo = chains.find(({ chainId }) => chainId === (id || chainId)) || chains?.[0]

    /* set the fetching state */
    // setWalletState((value) => ({
    //   ...value,
    //   chainId: chainInfo?.chainId,
    //   client: null,
    //   state: WalletStatusType.connecting,
    // }))

    try {
      await window.keplr.experimentalSuggestChain(chainInfo)
      await window.keplr.enable(chainInfo.chainId)

      const offlineSigner = await window.getOfflineSignerAuto(chainInfo.chainId)

      const wasmChainClient = await SigningCosmWasmClient.connectWithSigner(
        chainInfo.rpc,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(`${chainInfo?.gasPriceStep?.low}${chainInfo?.feeCurrencies?.[0].coinMinimalDenom}`)
        }
      )

      const [{ address }] = await offlineSigner.getAccounts()
      const key = await window.keplr.getKey(chainInfo.chainId)

      /* successfully update the wallet state */
      setWalletState({
        key,
        address,
        client: wasmChainClient,
        chainId: chainInfo?.chainId,
        status: WalletStatusType.connected,
      })
    } catch (e) {
      /* set the error state */
      // setWalletState({
      //   key: null,
      //   address: '',
      //   client: null,
      //   chainId: null,
      //   status: WalletStatusType.error,
      // })

      // toast({
      //   // title: 'Account created.',
      //   description: "Failed to connect thiere.",
      //   status: 'error',
      //   duration: 9000,
      //   position: "top",
      //   isClosable: true,
      // })

      /* throw the error for the UI */
      throw e
    }
  }, mutationOptions)

  useEffect(
    function restoreWalletConnectionIfHadBeenConnectedBefore() {
      /* restore wallet connection if the state has been set with the */
      if ((chainInfo as any)?.rpc && status === WalletStatusType.restored) {
        mutation.mutate(chainId)
      }
    }, // eslint-disable-next-line
    [status]
  )

  useEffect( 
    function listenToWalletAddressChangeInKeplr() {
      function reconnectWallet() {
        if (status === WalletStatusType.connected) {
          mutation.mutate(chainId)
        }
      }

      window.addEventListener('keplr_keystorechange', reconnectWallet)
      return () => {
        window.removeEventListener('keplr_keystorechange', reconnectWallet)
      }
    },
    // eslint-disable-next-line
    [status]
  )

  return mutation
}
