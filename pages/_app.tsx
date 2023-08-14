import { FC, useEffect } from 'react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { ChainProvider } from '@cosmos-kit/react-lite'
import { chains, assets } from 'chain-registry'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { wallets as shellWallets } from '@cosmos-kit/shell'
import { wallets as stationWallets } from '@cosmos-kit/station'
import { wallets as leapWallets } from '@cosmos-kit/leap'
import { wallets as cosmoStationWallets } from '@cosmos-kit/cosmostation'

import 'theme/global.css'

import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import {
  getChainOptions,
  StaticWalletProvider,
  WalletControllerChainOptions,
} from '@terra-money/wallet-provider'
import AppLoading from 'components/AppLoading'
import AppLayout from 'components/Layout/AppLayout'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'
import theme from 'theme'
import WalletModal from 'components/Wallet/Modal/WalletModal'
import { endpointOptions } from 'constants/endpointOptions'
import { signerOptions } from 'constants/signerOptions'

const ConnectedView = ({ onClose, onReturn, wallet }: WalletViewProps) => {
  const {
    walletInfo: { prettyName },
    username,
    address,
  } = wallet

  return <div>{`${prettyName}/${username}/${address}`}</div>
}

const MyApp: FC<AppProps> = ({
  Component,
  pageProps,
  defaultNetwork,
}: AppProps & WalletControllerChainOptions) => {
  const [mounted, setMounted] = useState<boolean>(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {typeof window !== 'undefined' ? (
        <>
          <Head>
            <link rel="shortcut icon" href="/favicon.ico" />
          </Head>
          <RecoilRoot>
            <QueryClientProvider client={queryClient}>
              <ChakraProvider theme={theme}>
                <ChainProvider
                  chains={chains} // supported chains
                  assetLists={assets} // supported asset lists
                  // @ts-ignore
                  wallets={[
                    ...keplrWallets,
                    ...cosmoStationWallets,
                    ...shellWallets,
                    ...stationWallets,
                    ...leapWallets,
                  ]} // supported wallets
                  walletModal={WalletModal}
                  signerOptions={signerOptions}
                  endpointOptions={endpointOptions}
                  walletConnectOptions={{
                    signClient: {
                      projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
                      relayUrl: 'wss://relay.walletconnect.org',
                      metadata: {
                        name: 'White Whale',
                        description: 'test',
                        url: 'https://app.whitewhale.money/',
                        icons: [
                          'https://raw.githubusercontent.com/cosmology-tech/cosmos-kit/main/packages/docs/public/favicon-96x96.png',
                        ],
                      },
                    },
                  }}
                >
                  <CSSReset />
                  {!mounted ? (
                    <AppLoading />
                  ) : (
                    <AppLayout>
                      {/* @ts-ignore */}
                      <Component {...pageProps} />
                    </AppLayout>
                  )}
                </ChainProvider>
              </ChakraProvider>
              <Toaster
                position="top-right"
                toastOptions={{ duration: 10000 }}
              />
              {/* </ErrorBoundary> */}
            </QueryClientProvider>
          </RecoilRoot>
        </>
      ) : (
        <StaticWalletProvider defaultNetwork={defaultNetwork}>
          <>
            <Head>
              <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <RecoilRoot>
              <QueryClientProvider client={queryClient}>
                <ChakraProvider theme={theme}>
                  <CSSReset />
                  {!mounted ? (
                    <AppLoading />
                  ) : (
                    <AppLayout>
                      {/* @ts-ignore */}
                      <Component {...pageProps} />
                    </AppLayout>
                  )}
                </ChakraProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{ duration: 10000 }}
                />
                {/* </ErrorBoundary> */}
              </QueryClientProvider>
            </RecoilRoot>
          </>
        </StaticWalletProvider>
      )}
      <Script src="/logs.js" />
    </>
  )
}
//@ts-ignore
MyApp.getInitialProps = async () => {
  const chainOptions = await getChainOptions()
  return {
    ...chainOptions,
  }
}

export default MyApp
