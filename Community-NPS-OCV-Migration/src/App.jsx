import React from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { FloodgateProvider } from "./providers/FloodgateProvider";
import { FloodgateTrigger } from "./components/FloodgateTrigger";

const App = () => (
    <FluentProvider theme={webLightTheme}>
        <FloodgateProvider>
            <div style={{ margin: 32 }}>
                <FloodgateTrigger />
            </div>
        </FloodgateProvider>
    </FluentProvider>
);

export default App;