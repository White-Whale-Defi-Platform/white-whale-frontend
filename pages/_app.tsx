import { ErrorBoundary } from 'components/ErrorBoundary'
import type { AppProps } from 'next/app'
import { useEffect, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { RecoilRoot } from 'recoil'
import { queryClient } from 'services/queryClient'
import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { useState } from 'react'
import theme from "../theme";
import AppLayout from 'components/Layout/AppLayout'
import AppLoading from 'components/AppLoading'
import Head from "next/head";


const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => setMounted(true), []);

  return (
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
  )
}

export default MyApp
