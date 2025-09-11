import { IDynamicCampaignConfig } from "@ms-ofb/officebrowserfeedbacknpm/scripts/app/Configuration/IInitOptions";
import { TelemetrySinkProvider } from "../logging/TelemetrySinkProvider";
import { Client as DynamicCampaignClient } from "@ms-ofb/officebrowserfeedback-ext-dynamic-campaign";
import { makeFloodgate } from '@ms-ofb/officebrowserfeedbacknpm/Floodgate'
import { OfficeBrowserFeedback } from "@ms-ofb/officebrowserfeedbacknpm/scripts/app/Window/Window";
import { APP_CONSTANTS, getEnvironmentConfig, isProduction,clearOCVStateStorage, isTestingMode } from "../utils/app-constants.js";

export async function loadAndInitialize(userDetails?: {
    userId?: string;    
    ssoId?: string;
}): Promise<OfficeBrowserFeedback> {

    const officeBrowserFeedback = makeFloodgate();
    const telemetrySinkProvider = new TelemetrySinkProvider(userDetails);
    const envConfig = getEnvironmentConfig();

    // Get locale
    const locale: string = document.documentElement.getAttribute("lang") ?? APP_CONSTANTS.ENVIRONMENT.LANGUAGE;

    // Generate session ID
    let sessionId = sessionStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
        sessionId = (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        sessionStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SESSION_ID, sessionId);
    }

    officeBrowserFeedback.initOptions = {
        appId: APP_CONSTANTS.FLOODGATE.APP_ID,
        complianceCheck: APP_CONSTANTS.UI.COMPLIANCE_CHECK,
        surveyEnabled: APP_CONSTANTS.UI.SURVEY_ENABLED,
        environment: APP_CONSTANTS.FLOODGATE.ENVIRONMENT,
        locale: locale,
        onError: (error: string) => { 
            if (!isProduction()) console.error(APP_CONSTANTS.ERROR_MESSAGES.SDK_ERROR + ":", error); 
        },
        applicationGroup: {
            appData: JSON.stringify({
                "AppId": APP_CONSTANTS.APP.ID,
                "AppName": APP_CONSTANTS.APP.NAME,
                "AppVersion": APP_CONSTANTS.APP.VERSION,
                "Environment": APP_CONSTANTS.ENVIRONMENT.TYPE,
                "Language": APP_CONSTANTS.ENVIRONMENT.LOCALE,                
                "SsoId": userDetails?.ssoId
            })
        },
        telemetryGroup: {
            audienceGroup: APP_CONSTANTS.TELEMETRY.AUDIENCE_GROUP,
            deviceId: APP_CONSTANTS.TELEMETRY.DEVICE_ID,
            loggableUserId: userDetails?.ssoId,
        },
        telemetrySink: telemetrySinkProvider.getTelemetrySink(),
        customResourcesSetExternally: APP_CONSTANTS.TELEMETRY.CUSTOM_RESOURCES_EXTERNALLY,
        sessionId: sessionId,
        build: APP_CONSTANTS.APP.BUILD_VERSION,
        authenticationType: userDetails?.ssoId ? APP_CONSTANTS.AUTH.TYPE.AAD : APP_CONSTANTS.AUTH.TYPE.UNAUTHENTICATED,
        isCommercialHost: APP_CONSTANTS.AUTH.IS_COMMERCIAL_HOST,
        retentionDurationDays: APP_CONSTANTS.FLOODGATE.RETENTION_DAYS,
    };

    officeBrowserFeedback.setUiStrings({});

    // Initialize Dynamic Campaign Extension
    let dynamicCampaignExtension;
    let floodgateDynamicCampaignConfig: IDynamicCampaignConfig = {
        enabled: APP_CONSTANTS.DYNAMIC_CAMPAIGN.ENABLED,
        ecsClient: undefined,
    };

    // Setup Dynamic Campaign filters using constants
    const dynamicCampaignFilters = new Map();
    Object.entries(APP_CONSTANTS.DYNAMIC_CAMPAIGN.FILTERS).forEach(([key, value]) => {
        dynamicCampaignFilters.set(key, value);
    });

    try {
        dynamicCampaignExtension = new DynamicCampaignClient({
            appName: APP_CONSTANTS.APP.NAME,
            appVersion: APP_CONSTANTS.APP.VERSION,
            language: APP_CONSTANTS.ENVIRONMENT.LOCALE,
            host: APP_CONSTANTS.DYNAMIC_CAMPAIGN.HOST,
            filters: dynamicCampaignFilters,
            localStorageProvider: officeBrowserFeedback.floodgate.getStorageProvider(),
        });

        await dynamicCampaignExtension.start();
        floodgateDynamicCampaignConfig.ecsClient = dynamicCampaignExtension;
        
        if (!isProduction()) {
            console.log(APP_CONSTANTS.SUCCESS_MESSAGES.DYNAMIC_CAMPAIGN_STARTED);
        }
        
    } catch (e) {
        if (!isProduction()) {
            console.error('Dynamic Campaign Error:', e);
        }
        floodgateDynamicCampaignConfig.enabled = false;
    }

    const onSurveyActivated = (launcher: any, survey: any) => {
        launcher.launch();
    };

    officeBrowserFeedback.floodgate.initOptions = {
        autoDismiss: APP_CONSTANTS.FLOODGATE.AUTO_DISMISS,
        complianceCheck: APP_CONSTANTS.UI.COMPLIANCE_CHECK,
        userId: userDetails?.ssoId,
        userLogin: userDetails?.ssoId,
        ssoId: userDetails?.ssoId,
        onDismiss: (campaignId: string, submitted: boolean) => {
            // Minimal logging for production
        },
        governanceServiceEnabled: APP_CONSTANTS.AUTH.GOVERNANCE_ENABLED,
        dynamicCampaignConfig: floodgateDynamicCampaignConfig,
        dynamicUxConfig: {
            enabled: true,
            cdnStringConfig: {
                uiStringsCdnEnabled: APP_CONSTANTS.UI.CDN_STRINGS_ENABLED,
                fetchCdnConcurrently: APP_CONSTANTS.UI.FETCH_CDN_CONCURRENTLY
            },
            footerButtonsAlignment: APP_CONSTANTS.FLOODGATE.FOOTER_ALIGNMENT,
            theme: APP_CONSTANTS.FLOODGATE.THEME,
        },
        onSurveyActivatedCallback: { onSurveyActivated },
        surveyEnabled: APP_CONSTANTS.UI.SURVEY_ENABLED,
        showEmailAddress: APP_CONSTANTS.AUTH.SHOW_EMAIL_ADDRESS,
        surveyContainer: APP_CONSTANTS.FLOODGATE.SURVEY_CONTAINER,
    };

    try {
        await officeBrowserFeedback.floodgate.initialize();
        if (!isProduction()) {
            console.log(APP_CONSTANTS.SUCCESS_MESSAGES.SDK_INITIALIZED);
        }

         // Clear OCV state storage again after initialization in testing mode
        if (isTestingMode()) {
            setTimeout(() => {
                clearOCVStateStorage();
            }, 1000); // Small delay to ensure initialization is complete
        }
    } catch (error) {
        console.error(APP_CONSTANTS.ERROR_MESSAGES.INIT_FAILED + ":", error);
        throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INIT_FAILED + ": " + error);
    }

    return officeBrowserFeedback;
}