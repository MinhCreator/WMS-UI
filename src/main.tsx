import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { ReduxProviders } from "./states/Provider";
import { installAuthBridge } from "./states/authBridge";
import { store } from "./states/store";
import { restoreSession } from "./states/slices/authSlice";
import App from "./App";
import theme from "./theme";
import "./index.css";

installAuthBridge();
void store.dispatch(restoreSession());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProviders>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme} resetCSS={false}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ReduxProviders>
  </React.StrictMode>,
);
