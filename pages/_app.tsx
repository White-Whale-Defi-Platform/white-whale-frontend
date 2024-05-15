import { FC, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'

import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import { wallets as cosmoStationWallets } from '@cosmos-kit/cosmostation'
import { wallets as galaxyStationWallets } from '@cosmos-kit/galaxy-station'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { wallets as leapWallets } from '@cosmos-kit/leap'
import { wallets as ninjiWallets } from '@cosmos-kit/ninji'
import { wallets as okxwallet } from '@cosmos-kit/okxwallet'
import { ChainProvider } from '@cosmos-kit/react-lite'
import { wallets as shellWallets } from '@cosmos-kit/shell'
import { wallets as stationWallets } from '@cosmos-kit/station'
import version from 'app_version.json'
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
import { getFastestAPI } from 'services/useAPI'
import theme from 'theme'

const MyApp: FC<AppProps> = ({
  Component,
  pageProps,
}: AppProps) => {
  const [mounted, setMounted] = useState<boolean>(false)
  const [api, setApi] = useState<string>('')

  const walletProviders = [
    {
      name: 'keplr',
      wallet: keplrWallets,
    },
    {
      name: 'station',
      wallet: stationWallets,
    },
    {
      name: 'leap',
      wallet: leapWallets,
    },
    {
      name: 'ninji',
      wallet: ninjiWallets,
    },
    {
      name: 'shellwallet',
      wallet: shellWallets,
    },
    {
      name: 'cosmostationWallet',
      wallet: cosmoStationWallets,
    },
    {
      name: 'okxwallet',
      wallet: okxwallet,
    },
    {
      name: 'galaxystation',
      wallet: galaxyStationWallets,
    },
  ];

  const reorderWallets = useMemo(() => {
    const newWallets: any[] = [];
    const newUnavailableWallets: any[] = [];
    try {
      walletProviders.forEach(({ name, wallet }) => {
        if (!window?.[name]) {
          newUnavailableWallets.push(...wallet);
        } else {
          newWallets.push(...wallet);
        }
      });
      return [...newWallets, ...newUnavailableWallets];
    } catch {
      return []
    }
  }, []);
  useEffect(() => {
    const localVersion = localStorage.getItem('ww-version');
    if (!localVersion || version?.version !== localVersion) {
      localStorage.clear()
      localStorage.setItem('ww-version', version?.version)
    }
    const setAPI = async () => setApi(await getFastestAPI(true))
    setAPI()
    setMounted(true)
  }, [reorderWallets, api])
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
              wallets={reorderWallets} // Supported wallets
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
