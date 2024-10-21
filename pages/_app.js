import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import merge from 'lodash.merge';
import { getDefaultWallets, RainbowKitProvider, darkTheme, Theme,   } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import MainLayout from "../layout/mainLayout";

const { chains, provider } = configureChains(
  [
    sepolia
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "ethervote",
  projectId: "8d419e5e746df5332cd772ec6294d8c4",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const myTheme = merge(darkTheme(), {
  blurs: {
    modalOverlay: 'small',
  },
  colors: {
    accentColor: '#181818',
    accentColorForeground: 'white',
    // actionButtonBorder: '...',
    // actionButtonBorderMobile: '...',
    // actionButtonSecondaryBackground: '...',
    closeButton: 'white',
    // closeButtonBackground: '...',
    connectButtonBackground: '#f9fafb',
    // connectButtonBackgroundError: '...',
    connectButtonInnerBackground: '#fce7f3',
    connectButtonText: '#181818',
    // connectButtonTextError: '...',
    // connectionIndicator: '...',
    // downloadBottomCardBackground: '...',
    // downloadTopCardBackground: '...',
    // error: '...',
    // generalBorder: '...',
    // generalBorderDim: '...',
    // menuItemBackground: '...',
    // modalBackdrop: '...',
    // modalBackground: '...',
    // modalBorder: '...',
    modalText: 'white',
    // modalTextDim: '...',
    // modalTextSecondary: '...',
    // profileAction: '...',
    // profileActionHover: '...',
    // profileForeground: '...',
    // selectedOptionBorder: '...',
    // standby: '...',
  },
  fonts: {
    body: 'DM Sans, sans-serif',
  },
  radii: {
    actionButton: 'none',
    connectButton: 'none',
    menuButton: 'none',
    modal: 'none',
    modalMobile: 'none',
  },
  // shadows: {
  //   connectButton: '...',
  //   dialog: '...',
  //   profileDetailsAction: '...',
  //   selectedOption: '...',
  //   selectedWallet: '...',
  //   walletLogo: '...',
  // },
});

export { WagmiConfig, RainbowKitProvider };

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        modalSize="wide"
        initialChain={sepolia}
        chains={chains}
        theme={myTheme}
      >
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;