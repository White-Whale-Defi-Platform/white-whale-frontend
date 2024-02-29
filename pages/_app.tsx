import { type FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from 'react-query';

import { CSSReset, ChakraProvider } from '@chakra-ui/react';
import { QuirksConfig, QuirksNextProvider } from '@quirks/react';
import type { Config } from '@quirks/store';
import {
  cosmostationExtension,
  keplrExtension,
  leapExtension,
  okxExtension,
  shellExtension,
  stationExtension,
} from '@quirks/wallets';
import 'theme/global.css';
import AppLayout from 'components/Layout/AppLayout';
import { chains, assetsLists } from 'constants/chains';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { RecoilRoot } from 'recoil';
import { queryClient } from 'services/queryClient';
import theme from 'theme';

const config: Config = {
  wallets: [
    keplrExtension,
    stationExtension,
    leapExtension,
    shellExtension,
    cosmostationExtension,
    okxExtension,
  ], // Use a list of wallet, like keplr and leap, from wallets
  chains, // Use a list of chains, like osmosis, from chain-registry
  assetsLists, // Use a list of assetlist, like the osmosis one, from chain-registry
  walletConnectOptions: {
    providerOpts: {
      projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
      metadata: {
        name: 'White Whale',
        description: 'test',
        url: 'https://app.whitewhale.money/',
        icons: [
          'https://raw.githubusercontent.com/cosmology-tech/cosmos-kit/main/packages/docs/public/favicon-96x96.png',
        ],
      },
    },
  },
};

const App: FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <link rel="shortcut icon" href="/favicon.ico" />
    </Head>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <QuirksNextProvider>
            <QuirksConfig config={config}>
              <CSSReset />
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
            </QuirksConfig>
          </QuirksNextProvider>
        </ChakraProvider>
        <Toaster position="top-right" toastOptions={{ duration: 10000 }} />
        {/* </ErrorBoundary> */}
      </QueryClientProvider>
    </RecoilRoot>
    <Script src="/logs.js" />
  </>
);

export default App;
