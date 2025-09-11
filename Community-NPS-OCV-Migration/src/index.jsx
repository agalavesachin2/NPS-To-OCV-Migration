import React from "react";
import ReactDOM from "react-dom";
import App from './App';
import { global_variables } from "./freemarker-variables";
import { APP_CONSTANTS, isProduction } from "../src/utils/app-constants.js";

function initializeApp() {
    if (!global_variables?.sso_id) {
        const target = document.getElementById(APP_CONSTANTS.FLOODGATE.SURVEY_CONTAINER);
        if (target) {
            ReactDOM.render(<div style={{ padding: '20px', textAlign: 'center', color: '#666', fontFamily: 'Arial, sans-serif' }}>
                    <h3>{APP_CONSTANTS.ERROR_MESSAGES.AUTH_REQUIRED}</h3>
                    <p>Please log in with your SSO account to access this application.</p>
            </div>, target);
        }
        return;
    }

    const target = document.getElementById(APP_CONSTANTS.FLOODGATE.SURVEY_CONTAINER);
    if (!target) {
        console.error(APP_CONSTANTS.ERROR_MESSAGES.TARGET_NOT_FOUND + ":", APP_CONSTANTS.FLOODGATE.SURVEY_CONTAINER);
        return;
    }

    try {
       ReactDOM.render(<App />, target);
        if (!isProduction()) {
            console.log(APP_CONSTANTS.SUCCESS_MESSAGES.APP_RENDERED);
        }
    } catch (error) {
        console.error(APP_CONSTANTS.ERROR_MESSAGES.RENDER_FAILED + ":", error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}