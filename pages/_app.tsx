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
import WalletModal from 'components/Wallet/Modal/WalletModal';
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
  ],
  chains,
  assetsLists,
  signOptions: {
    preferNoSetFee: true,
    preferNoSetMemo: true,
    disableBalanceCheck: true,
  },
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

const App = ({ Component, pageProps }: AppProps) => (
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
                <WalletModal />
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
