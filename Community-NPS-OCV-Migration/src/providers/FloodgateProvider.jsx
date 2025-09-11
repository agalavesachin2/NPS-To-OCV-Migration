import React, { useState, useEffect, createContext, useContext } from 'react';
import { OfficeBrowserFeedback } from '@ms-ofb/officebrowserfeedbacknpm/scripts/app/Window/Window';
import { loadAndInitialize } from '../sdk/officeBrowserFeedbackSetup';
import {global_variables} from "../freemarker-variables";
import { clearOCVStateStorage, isTestingMode, AppUsageTimeout,OCV_CLEAR_DELAY } from "../utils/app-constants.js";
// Create the context with default values
const FloodgateContext = createContext({
    logActivity: () => console.log("Floodgate context not initialized yet"),
    logActivityStartTime: () => console.log("Floodgate context not initialized yet"),
    logActivityStopTime: () => console.log("Floodgate context not initialized yet"),
    logReadyToPrompt: () => console.log("Floodgate context not initialized yet"), // Add this
    start: async () => console.log("Floodgate context not initialized yet"),
    stop: () => console.log("Floodgate context not initialized yet"),
    loading: true,
    error: null,
    isInitialized: false
});

/**
 * FloodgateProvider initializes the OfficeBrowserFeedback instance once and provides
 * simple activity logging functions to all child components through React Context.
 * 
 * This abstracts away the complexity of the officeBrowserFeedback object and provides
 * a clean API for components to log Floodgate activities and control the engine.
 */
export const FloodgateProvider = ({ children }) => {
    const [officeBrowserFeedback, setOfficeBrowserFeedback] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Start function that wraps the Floodgate SDK start method
    const start = async () => {
        if (isInitialized && officeBrowserFeedback) {
            try {
                await officeBrowserFeedback.floodgate.start();
                console.log('Floodgate engine started');
            } catch (err) {
                console.error('Failed to start Floodgate engine', err);
            }
        } else {
            console.log('Cannot start Floodgate engine: Floodgate not initialized');
        }
    };

    // Stop function that wraps the Floodgate SDK stop method
    const stop = () => {
        if (isInitialized && officeBrowserFeedback) {
            try {
                officeBrowserFeedback.floodgate.stop();
                console.log('Floodgate engine stopped');
            } catch (err) {
                console.error('Failed to stop Floodgate engine', err);
            }
        } else {
            console.log('Cannot stop Floodgate engine: Floodgate not initialized');
        }
    };

// Initialize Floodgate once when the component mounts
useEffect(() => {
    const initializeFloodgate = async () => {

         // Clear OCV state storage in testing mode before initialization
            if (isTestingMode()) {
                clearOCVStateStorage();
            }

        // Check if global variables are defined before initializing
        if (!global_variables || !global_variables.sso_id) {
            console.log('FloodgateProvider: User not authenticated. Skipping Floodgate initialization.');
            setLoading(false);
            setError(new Error('User not authenticated - Floodgate initialization skipped'));
            return;
        }

        try {
            // Pass user details to loadAndInitialize
            const userDetails = {
                userId: global_variables.user_id,
                ssoId: global_variables.sso_id,
            };

            console.log('FloodgateProvider: Initializing Floodgate with user details:', userDetails);
            
            const obfObject = await loadAndInitialize(userDetails);
            await obfObject.floodgate.start();

            setOfficeBrowserFeedback(obfObject);
            console.log('FloodgateProvider: Floodgate SDK initialized successfully');
            
            setIsInitialized(true);
            setLoading(false);

            window.OfficeBrowserFeedback = obfObject;

              // Clear OCV state storage again after successful initialization in testing mode
                if (isTestingMode()) {
                    setTimeout(() => {
                        clearOCVStateStorage();
                    }, OCV_CLEAR_DELAY); // Delay to ensure everything is initialized
                }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error initializing Floodgate';
            console.error('FloodgateProvider: Failed to initialize Floodgate SDK', err);
            setError(new Error(`Floodgate initialization failed: ${errorMessage}`));
            setLoading(false);
        }
    };

    initializeFloodgate();
}, []);

    // Set up event listeners for window focus/blur to start/stop Floodgate automatically
    useEffect(() => {
        if (isInitialized && officeBrowserFeedback) {
            const handleFocus = () => {
                start();
            };
            
            const handleBlur = () => {
                stop();
            };
            
            let appUsageTimer = setTimeout(() => {  
                stop();
            }, AppUsageTimeout);

            const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {   
                    start();
                    appUsageTimer = setTimeout(() => stop(), AppUsageTimeout);
                } else {
                    clearTimeout(appUsageTimer);
                    stop();
                }
            };
            
            window.addEventListener('focus', handleFocus);
            window.addEventListener('blur', handleBlur);
            window.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {   
                    start();
                    appUsageTimer = setTimeout(() => {  
                        stop();
                    }, AppUsageTimeout);
                } else {
                    clearTimeout(appUsageTimer);
                    stop();
                }
            });
            
            return () => {
                window.removeEventListener('focus', handleFocus);
                window.removeEventListener('blur', handleBlur);
                window.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [isInitialized, officeBrowserFeedback]);

    // Activity logging functions that check if Floodgate is initialized before calling
    const logActivity = (activity) => {
        if (isInitialized && officeBrowserFeedback) {
            officeBrowserFeedback.floodgate.getEngine().getActivityListener().logActivity(activity);
        } else {
            console.log(`Floodgate Activity '${activity}' tried to be logged but floodgate did not initialize successfully.`);
        }
    };

    const logActivityStartTime = (activity) => {
        if (isInitialized && officeBrowserFeedback) {
            officeBrowserFeedback.floodgate.getEngine().getActivityListener().logActivityStartTime(activity);
        } else {
            console.log(`Floodgate Activity StartTime '${activity}' tried to be logged but floodgate did not initialize successfully.`);
        }
    };

    const logActivityStopTime = (activity) => {
        if (isInitialized && officeBrowserFeedback) {
            officeBrowserFeedback.floodgate.getEngine().getActivityListener().logActivityStopTime(activity);
        } else {
            console.log(`Floodgate Activity StopTime '${activity}' tried to be logged but floodgate did not initialize successfully.`);
        }
    };
    // Add this helper function after the other log functions
    const logReadyToPrompt = () => {
        if (isInitialized && officeBrowserFeedback) {
            officeBrowserFeedback.floodgate.getEngine().getActivityListener().logActivity("ReadytoPrompt");
            console.log('ReadytoPrompt activity logged - app is ready for surveys');
        } else {
            console.log(`ReadytoPrompt activity tried to be logged but floodgate did not initialize successfully.`);
        }
    };

    const contextValue = {
        logActivity,
        logActivityStartTime,
        logActivityStopTime,
        logReadyToPrompt, // Add this new function
        start,
        stop,
        loading,
        error,
        isInitialized
    };

    return (
        <FloodgateContext.Provider value={contextValue}>
            {children}
        </FloodgateContext.Provider>
    );
};

/**
 * Hook to use Floodgate functionality within any component
 * 
 * Usage:
 * const { logActivity, start, stop, loading, isInitialized } = useFloodgate();
 * 
 * // To log a simple activity
 * logActivity("ButtonClick");
 * 
 * // To measure time spent on an activity
 * // Log when the activity starts.
 * logActivityStartTime("UserIsUsingFeature");
 * // ... other things happen ...
 * // Log stop time when the activity ends. Floodgate records and updates the time spent.
 * logActivityStopTime("UserIsUsingFeature");
 * 
 * // To control the Floodgate engine
 * await start(); // Start the engine (async)
 * stop();        // Stop the engine
 */
export const useFloodgate = () => {
    const context = useContext(FloodgateContext);

    if (context === undefined) {
        throw new Error('useFloodgate must be used within a FloodgateProvider');
    }

    return context;
};