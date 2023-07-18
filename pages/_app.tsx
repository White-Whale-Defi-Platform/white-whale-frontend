import { FC, useEffect } from 'react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'

import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { assets, chains } from 'chain-registry';

import 'theme/global.css'

import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import {
  getChainOptions,
  StaticWalletProvider,
  WalletControllerChainOptions,
  WalletProvider,
} from '@terra-money/wallet-provider'
import AppLoading from 'components/AppLoading'
import AppLayout from 'components/Layout/AppLayout'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'
import theme from 'theme'

const ConnectedView = ({
  onClose,
  onReturn,
  wallet,
}: WalletViewProps) => {
  const {
    walletInfo: { prettyName },
    username,
    address,
  } = wallet;
 
  return <div>{`${prettyName}/${username}/${address}`}</div>;
};


const MyApp: FC<AppProps> = ({
  Component,
  pageProps,
  defaultNetwork,
  walletConnectChainIds,
}: AppProps & WalletControllerChainOptions) => {
  const [chainName, setChainName] = useState<ChainName | undefined>(
    'terra2'
  );

  const [mounted, setMounted] = useState<boolean>(false)

  const signerOptions: SignerOptions = {
    // signingStargate: (_chain: Chain) => {
    //   return getSigningCosmosClientOptions();
    // }
  };
  useEffect(() => {
    setChainName(window.localStorage.getItem('selected-chain') || 'terra2');
    setMounted(true)
  } , [])

  return typeof window !== 'undefined' ? (
    <WalletProvider
      defaultNetwork={defaultNetwork}
      walletConnectChainIds={walletConnectChainIds}
    >
      <ChainProvider
        chains={chains}
        assetLists={assets}
        wallets={[...keplrWallets, ...cosmostationWallets, ...leapWallets]}
        walletConnectOptions={{
          signClient: {
            projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
            relayUrl: 'wss://relay.walletconnect.org',
            metadata: {
              name: 'CosmosKit Template',
              description: 'CosmosKit dapp template',
              url: 'https://docs.cosmoskit.com/',
              icons: [],
            },
          },
        }}
        wrappedWithChakra={true}
        signerOptions={signerOptions}
      >
      <>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            {/* <ErrorBoundary> */}
            <ChakraProvider theme={theme}>
              <CSSReset />
              {!mounted ? (
                <AppLoading />
              ) : (
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              )}
            </ChakraProvider>
            <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
            {/* </ErrorBoundary> */}
          </QueryClientProvider>
        </RecoilRoot>
      </>
      </ChainProvider>
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={defaultNetwork}>
      <ChainProvider
        chains={chains}
        assetLists={assets}
        wallets={[...keplrWallets, ...cosmostationWallets, ...leapWallets]}
        walletConnectOptions={{
          signClient: {
            projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
            relayUrl: 'wss://relay.walletconnect.org',
            metadata: {
              name: 'CosmosKit Template',
              description: 'CosmosKit dapp template',
              url: 'https://docs.cosmoskit.com/',
              icons: [],
            },
          },
        }}
        wrappedWithChakra={true}
        signerOptions={signerOptions}
      >
      <>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            {/* <ErrorBoundary> */}
            <ChakraProvider theme={theme}>
              <CSSReset />
              {!mounted ? (
                <AppLoading />
              ) : (
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              )}
            </ChakraProvider>
            <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
            {/* </ErrorBoundary> */}
          </QueryClientProvider>
        </RecoilRoot>
      </>
      </ChainProvider>
    </StaticWalletProvider>
  )
}

MyApp.getInitialProps = async () => {
  const chainOptions = await getChainOptions()
  return {
    ...chainOptions,
  }
}

export default MyApp
