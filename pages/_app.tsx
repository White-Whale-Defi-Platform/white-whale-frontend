import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { getChainOptions, StaticWalletProvider,WalletControllerChainOptions, WalletProvider } from '@terra-money/wallet-provider'
import AppLoading from 'components/AppLoading'
import AppLayout from 'components/Layout/AppLayout'
import type { AppProps } from 'next/app'
import Head from "next/head";
import { FC,useEffect } from 'react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'

import theme from "../theme";


const MyApp: FC<AppProps> = ({ Component, pageProps,  defaultNetwork,
  walletConnectChainIds } : AppProps & WalletControllerChainOptions) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [chainOpts, setChainOpts] = useState({})

  useEffect(() => setMounted(true), []);

  return typeof window !== 'undefined' ? (
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
          {/* <ErrorBoundary> */}
            <ChakraProvider theme={theme}>
              <CSSReset />
              {
                !mounted ? <AppLoading /> : (
                  <AppLayout >
                    <Component {...pageProps} />
                  </AppLayout>
                )
              }
            </ChakraProvider>
            <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
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
            {
              !mounted ? <AppLoading /> : (
                <AppLayout >
                  <Component {...pageProps} />
                </AppLayout>
              )
            }
          </ChakraProvider>
          <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
          {/* </ErrorBoundary> */}
        </QueryClientProvider>
      </RecoilRoot>
    </>
    </StaticWalletProvider>
  );
}


MyApp.getInitialProps = async () => {
  const chainOptions = await getChainOptions();
  return {
    ...chainOptions,
  };
};

export default MyApp
