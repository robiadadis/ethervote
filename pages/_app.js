import merge from 'lodash.merge';
import { getDefaultWallets, RainbowKitProvider, darkTheme, Theme, } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import MainLayout from "../layout/mainLayout";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

const { chains, provider } = configureChains(
  [
    sepolia //Network
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

// Rainbowkit Custom
const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#181818',
    accentColorForeground: 'white',
    // actionButtonBorder: '...',
    // actionButtonBorderMobile: '...',
    // actionButtonSecondaryBackground: '...',
    closeButton: 'white',
    // closeButtonBackground: '...',
    connectButtonBackground: '#181818',
    // connectButtonBackgroundError: '...',
    connectButtonInnerBackground: '#f1f5f9',
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
    modalBackground: '#181818',
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
    actionButton: '2px',
    connectButton: '2px',
    menuButton: '2px',
    modal: '2px',
    modalMobile: '2px',
  },
  blurs: {
    modalOverlay: 'small',
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