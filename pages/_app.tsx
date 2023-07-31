import { FC, useEffect } from 'react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'

import 'theme/global.css'

import { CSSReset, ChakraProvider } from '@chakra-ui/react'
import {
  StaticWalletProvider,
  WalletControllerChainOptions,
  WalletProvider,
  getChainOptions,
} from '@terra-money/wallet-provider'
import AppLoading from 'components/AppLoading'
import AppLayout from 'components/Layout/AppLayout'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'
import theme from 'theme'

const MyApp: FC<AppProps> = ({
  Component,
  pageProps,
  defaultNetwork,
  walletConnectChainIds,
}: AppProps & WalletControllerChainOptions) => {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => setMounted(true), [])

  return (
    <>
      {typeof window !== 'undefined' ? (
        <WalletProvider
          defaultNetwork={defaultNetwork}
          walletConnectChainIds={walletConnectChainIds}
        >
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
        </WalletProvider>
      ) : (
        <StaticWalletProvider defaultNetwork={defaultNetwork}>
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

MyApp.getInitialProps = async () => {
  const chainOptions = await getChainOptions()
  return {
    ...chainOptions,
  }
}

export default MyApp
