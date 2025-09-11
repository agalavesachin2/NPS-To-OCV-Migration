import React, { useEffect, useState } from "react";
import { useFloodgate } from "../providers/FloodgateProvider";
import { global_variables } from "../freemarker-variables";
import { FLOODGATE_ACTIVITIES, isProduction } from "../utils/app-constants.js";

/**
 * FloodgateTrigger Component
 * 
 * Automatically triggers Floodgate activities when the user is authenticated
 * and the Floodgate SDK is initialized. This component doesn't render any UI.
 * 
 * Triggered Activities:
 * - AppUsageTime: Indicates user is actively using the app
 * - ReadyToPrompt: Indicates the app is ready to show surveys
 * 
 * @returns {null} This component doesn't render any UI elements
 */
export const FloodgateTrigger = () => {
    const { logActivity, isInitialized } = useFloodgate();
    const [hasTriggeredSurvey, setHasTriggeredSurvey] = useState(false);

    useEffect(() => {
        if (!isProduction()) {
            console.log('FloodgateTrigger: isInitialized =', isInitialized);
            console.log('FloodgateTrigger: hasSSO =', !!global_variables?.sso_id);
            console.log('FloodgateTrigger: hasTriggered =', hasTriggeredSurvey);
        }

        const logFloodgateActivities = async () => {
            try {
                if (isInitialized && global_variables?.sso_id && !hasTriggeredSurvey) {
                    // Log initial app usage
                    await logActivity(FLOODGATE_ACTIVITIES.APP_USAGE_TIME);
                    
                    // Log ReadyToPrompt to indicate app is ready for surveys
                    await logActivity(FLOODGATE_ACTIVITIES.READY_TO_PROMPT);
                    
                    setHasTriggeredSurvey(true);
                    
                    if (!isProduction()) {
                        console.log('Floodgate activities logged: AppUsageTime and ReadyToPrompt');
                    }
                    
                } else if (!global_variables?.sso_id) {
                    if (!isProduction()) {
                        console.log("User is not logged in with SSO, floodgate will not be triggered");
                    }
                }
            } catch (error) {
                console.error('Failed to log Floodgate activities:', error);
            }
        };

        logFloodgateActivities();
    }, [isInitialized, logActivity, hasTriggeredSurvey]);

    // Return null since we don't need to render anything
    return null;
};