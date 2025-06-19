export async function initializeFloodgate() {
  try {
    // Wait until the SDK is loaded
    if (
      !window.OfficeBrowserFeedback ||
      !window.OfficeBrowserFeedback.floodgate
    ) {
      console.error("Floodgate SDK is not available on window.");
      return;
    }

    console.log("Floodgate SDK detected. Proceeding to initOptions...");

    // Disable legacy UI strings
    window.OfficeBrowserFeedback.setUiStrings({});

    // Set initOptions
    window.OfficeBrowserFeedback.initOptions = {
      tenantId: "eb0a1442-99c1-4f9a-bbad-83d7ad2b0c47",
      appId: 50378,
      environment: 1,
      intlUrl: "/html/assets/",
     // customResourcesSetExternally: 2,
      telemetrySink: {
        logEvent: function (eventName, payload) {
          console.log(`[Telemetry] ${eventName}`, payload);
        },
      },
    };

    // Load campaign definitions
    const response = await fetch("/html/assets/campaign-definitions.json");
    if (!response.ok) throw new Error("Failed to load campaign-definitions.json");

    const campaignDefinitions = await response.json();
    console.log("Campaign definitions loaded:", campaignDefinitions);

    // Initialize SDK (make sure to wait for it to complete)
    await window.OfficeBrowserFeedback.floodgate
      .initialize({
        campaignDefinitions,
        onSurveyActivatedCallback: {
          onSurveyActivated: (launcher) => {
            console.log("Survey is ready, launching...");
              window.OfficeBrowserFeedback.floodgate.showCustomSurvey({
    surveyId: "060986b2-6817-422f-bfa1-4aca1a53b439",
  });
           // launcher.launch();
            // Fallback manual launch since trackActivity is not available
        // window.OfficeBrowserFeedback.floodgate.showCustomSurvey({
        //   surveyId: "060986b2-6817-422f-bfa1-4aca1a53b439",
        // });
          },
        },
      })
      .then(() => {
        console.log("Floodgate initialized. Now starting...");
        return window.OfficeBrowserFeedback.floodgate.start();        
      })
      .then(() => {
        console.log("Floodgate engine started.");
        console.log("Tracking activity: app.opened");
     //   window.OfficeBrowserFeedback.floodgate.trackActivity("app.opened");
      })
      .catch((err) => {
        console.error("Floodgate failed to initialize or start:", err);
      });

    // Handle focus and blur events
    window.addEventListener("focus", () => {
      window.OfficeBrowserFeedback.floodgate.start();
    });

    window.addEventListener("blur", () => {
      window.OfficeBrowserFeedback.floodgate.stop();
    });

    window.addEventListener("unload", () => {
      window.OfficeBrowserFeedback.floodgate.stop();
    });
  } catch (error) {
    console.error("Floodgate init failed", error);
  }
}


// export async function initializeFloodgate() {
//   try {
//     if (
//       !window.OfficeBrowserFeedback ||
//       !window.OfficeBrowserFeedback.floodgate
//     ) {
//       console.error("Floodgate SDK is not available on window.");
//       return;
//     }

//     console.log("Floodgate SDK detected. Proceeding to initOptions...");

//     window.OfficeBrowserFeedback.setUiStrings({});

//     window.OfficeBrowserFeedback.initOptions = {
//       tenantId: "eb0a1442-99c1-4f9a-bbad-83d7ad2b0c47",
//       appId: 50378,
//       environment: 1,
//       locale: "en-us",
//       stylesUrl: "/html/assets/officebrowserfeedback.css",
//       intlUrl: "/html/assets/intl/",
//       customResourcesSetExternally: 2,
//       telemetrySink: {
//         logEvent: function (eventName, payload) {
//           console.log(`[Telemetry] ${eventName}`, payload);
//         },
//       },
//     };

//     // Minimal customSurvey payload (as per doc)
//     const customSurvey = {
//       campaignId: "060986b2-6817-422f-bfa1-4aca1a53b439",
//       commentQuestion: "What can we improve?",
//       isZeroBased: false,
//       promptQuestion: "How satisfied are you?",
//       promptNoButtonText: "No",
//       promptYesButtonText: "Yes",
//       ratingQuestion: "Rate your experience",
//       ratingValuesAscending: [
//         "Very Poor",
//         "Poor",
//         "Average",
//         "Good",
//         "Excellent",
//       ],
//       showPrompt: false,
//       surveyType: 4,
//       title: "We'd love your feedback!",
//     };

//     await window.OfficeBrowserFeedback.floodgate.initialize();
//     console.log("Floodgate initialized successfully");

//     await window.OfficeBrowserFeedback.floodgate.start();
//     console.log("Floodgate engine started");

//     // 🔥 Directly launch the custom survey
//     await window.OfficeBrowserFeedback.floodgate
//       .showCustomSurvey(customSurvey)
//       .then(() => {
//         console.log("Custom survey launched successfully");
//       })
//       .catch((err) => {
//         console.error("Custom survey launch failed:", err);
//       });

//     // Optionally hook to window events
//     window.addEventListener("blur", () => {
//       window.OfficeBrowserFeedback.floodgate.stop();
//     });

//     window.addEventListener("focus", () => {
//       window.OfficeBrowserFeedback.floodgate.start();
//     });

//     window.addEventListener("unload", () => {
//       window.OfficeBrowserFeedback.floodgate.stop();
//     });
//   } catch (err) {
//     console.error("Floodgate init failed", err);
//   }
// }
