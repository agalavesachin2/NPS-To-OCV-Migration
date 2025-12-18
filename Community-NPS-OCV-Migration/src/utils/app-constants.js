// Application Configuration Constants
export const APP_CONSTANTS = {
    // ECS Endpoint Configuration
    ECS_ENDPOINTS: {
        PRODUCTION: "https://config.edge.skype.com",
        PRE_PRODUCTION: "https://config.edge.skype.net"
    },

    // Basic App Information
    APP: {
        ID: 2931,
        NAME: "Microsoft Fabric",
        VERSION: "18.0.1234.0",
        BUILD_VERSION: "18.0.1234.0",
        PLATFORM: "Web"
    },

    // Environment Configuration
    ENVIRONMENT: {
        TYPE: "Pre-Production", // "Production", "Pre-Production", "Development"
        LOCALE: "en-us",
        LANGUAGE: "en",
        IS_PRODUCTION: false
    },

    // Floodgate SDK Configuration
    FLOODGATE: {
        APP_ID: 50378, // 50378 = Pre-Production - 2931 = Production
        ENVIRONMENT: 1, // 0 = Production, 1 = Integration
        AUTO_DISMISS: 2,
        RETENTION_DAYS: 90,
        SURVEY_CONTAINER: "nps-display",
        THEME: "TeamsLightV2",
        FOOTER_ALIGNMENT: 0
    },

    // Authentication Configuration
    AUTH: {
        TYPE: {
            MSA: 0,
            AAD: 1,
            UNAUTHENTICATED: 2
        },
        IS_COMMERCIAL_HOST: true,
        SHOW_EMAIL_ADDRESS: true,
        GOVERNANCE_ENABLED: false
    },

    // Telemetry Configuration
    TELEMETRY: {
        AUDIENCE_GROUP: "TestAudienceGroup",
        DEVICE_ID: "TestDeviceId",
        CUSTOM_RESOURCES_EXTERNALLY: 2
    },

    // Dynamic Campaign Configuration
    DYNAMIC_CAMPAIGN: {
        ENABLED: true,
        HOST: "", // Will be set dynamically based on environment
        AGENT: "ChillMicrosoftFabric",
        AUDIENCE: "Internal",
        SURVEY_VALIDATION: "true",
        FILTERS: {
            agent: "ChillMicrosoftFabric",
            Environment: "External",
            Audience: "Internal",
            SurveyValidation: "true"
        }
    },

    // UI Configuration
    UI: {
        CDN_STRINGS_ENABLED: true,
        FETCH_CDN_CONCURRENTLY: false,
        COMPLIANCE_CHECK: true,
        SURVEY_ENABLED: true
    },

    // Storage Keys
    STORAGE_KEYS: {
        SESSION_ID: "ocvSessionId",
        DEVICE_ID: "floodgate-deviceId",
        OTEL_SESSION_ID: "otelSessionId"
    },

    // Error Messages
    ERROR_MESSAGES: {
        SDK_ERROR: "SDK encountered an error",
        INIT_FAILED: "Floodgate initialization failed",
        TARGET_NOT_FOUND: "Target element not found",
        AUTH_REQUIRED: "SSO Authentication Required",
        RENDER_FAILED: "Failed to render app"
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        APP_RENDERED: "App successfully rendered",
        SDK_INITIALIZED: "Floodgate SDK initialized successfully",
        USER_AUTHENTICATED: "User authenticated with SSO",
        DYNAMIC_CAMPAIGN_STARTED: "Dynamic Campaign client started"
    }
    
};

// Environment-specific configurations
export const ENV_CONFIG = {
    PRODUCTION: {
        FLOODGATE_ENV: 0,
        LOG_LEVEL: "error",
        DEBUG_ENABLED: false
    },
    PRE_PRODUCTION: {
        FLOODGATE_ENV: 1,
        LOG_LEVEL: "warn",
        DEBUG_ENABLED: true
    },
    DEVELOPMENT: {
        FLOODGATE_ENV: 1,
        LOG_LEVEL: "debug",
        DEBUG_ENABLED: true
    }
};

// Export helper functions
export const getEnvironmentConfig = (envType = APP_CONSTANTS.ENVIRONMENT.TYPE) => {
    return ENV_CONFIG[envType.toUpperCase().replace("-", "_")] || ENV_CONFIG.DEVELOPMENT;
};

export const getECSEndpoint = (envType = APP_CONSTANTS.ENVIRONMENT.TYPE) => {
    const endpoint = APP_CONSTANTS.ECS_ENDPOINTS[envType.toUpperCase().replace("-", "_")];
    return endpoint || APP_CONSTANTS.ECS_ENDPOINTS.PRE_PRODUCTION;
};

// Set DYNAMIC_CAMPAIGN HOST based on current environment
APP_CONSTANTS.DYNAMIC_CAMPAIGN.HOST = getECSEndpoint();

export const isProduction = () => {
    return APP_CONSTANTS.ENVIRONMENT.TYPE === "Production";
};

export const isDevelopment = () => {
    return APP_CONSTANTS.ENVIRONMENT.TYPE === "Pre-Production" || APP_CONSTANTS.ENVIRONMENT.TYPE === "Development";
};


// OCV configurations and variables
export const OCVStateLocalStorageKeys = [
    "obf-GovernedChannelStates",
    "obf-CampaignStates",
    "obf-SurveyActivationStats",
    "obf-SurveyEventActivityStats"
];


// Internal Logging Constants
export const FLOODGATE_ACTIVITIES = {
    APP_USAGE_TIME: "AppUsageTime",
    READY_TO_PROMPT: "ReadytoPrompt"
};

// Utility function to clear OCV state storage
export const clearOCVStateStorage = () => {
    OCVStateLocalStorageKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            console.log(`Cleared localStorage key: ${key}`);
        } catch (error) {
            console.warn(`Failed to clear localStorage key: ${key}`, error);
        }
    });
    console.log("OCV state storage cleared for testing");
};

// Check if we're in testing mode
export const isTestingMode = () => {
    return APP_CONSTANTS.ENVIRONMENT.TYPE !== "Production" && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname.includes('dev') ||
            process.env.NODE_ENV === 'development');
};

// Use constants
export const AppUsageTimeout = 5 * 60 * 1000; // 5 minutes
export const OCV_CLEAR_DELAY = 1000; // 1 second
