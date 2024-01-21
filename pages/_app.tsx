import { FC, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'

import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import { wallets as cosmoStationWallets } from '@cosmos-kit/cosmostation'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { wallets as leapWallets } from '@cosmos-kit/leap'
import { wallets as ninjiWallets } from '@cosmos-kit/ninji'
import { ChainProvider } from '@cosmos-kit/react-lite'
import { wallets as shellWallets } from '@cosmos-kit/shell'
import { wallets as stationWallets } from '@cosmos-kit/station'

import { chains, assets } from 'chain-registry'
import 'theme/global.css'
import AppLoading from 'components/AppLoading'
import AppLayout from 'components/Layout/AppLayout'
import WalletModal from 'components/Wallet/Modal/WalletModal'
import { endpointOptions } from 'constants/endpointOptions'
import { signerOptions } from 'constants/signerOptions'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'
import theme from 'theme'

const MyApp: FC<AppProps> = ({
  Component,
  pageProps,
}: AppProps) => {
  const [mounted, setMounted] = useState<boolean>(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const wallets = [
    ...keplrWallets,
    ...leapWallets,
    ...stationWallets,
    ...cosmoStationWallets,
    ...ninjiWallets,
    ...shellWallets,
  ]
  return (
        <><>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider theme={theme}>
            <ChainProvider
              chains={chains} // Supported chains
              assetLists={assets} // Supported asset lists
              wallets={wallets} // Supported wallets
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
                  <Component {...pageProps} />
                </AppLayout>
              )}
            </ChainProvider>
          </ChakraProvider>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 10000 }} />
          {/* </ErrorBoundary> */}
        </QueryClientProvider>
      </RecoilRoot>
    </><Script src="/logs.js" /></>
  )
}


export default MyApp
