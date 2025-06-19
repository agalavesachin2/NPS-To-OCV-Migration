import React, { useEffect } from "react";
import { initializeFloodgate } from "../sdk/floodgate";

// Helper to wait until the Floodgate SDK is fully loaded
const waitForFloodgateSdk = (retries = 20, delay = 300) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (
        window.OfficeBrowserFeedback &&
        window.OfficeBrowserFeedback.floodgate &&
        typeof window.OfficeBrowserFeedback.floodgate.initialize === "function"
      ) {
        clearInterval(interval);
        resolve();
      }

      if (--retries <= 0) {
        clearInterval(interval);
        reject(new Error("Floodgate SDK failed to load in time."));
      }
    }, delay);
  });
};

const FeedbackHandler = () => {
  useEffect(() => {
    console.log("FeedbackHandler mounted");

    if (window.location.hostname === "localhost") {
      console.log("SDK not loaded on localhost.");
      return;
    }

    // Wait for Floodgate SDK to be available before initializing
    waitForFloodgateSdk()
      .then(() => {
        console.log("SDK is available, initializing Floodgate...");
        initializeFloodgate();
      })
      .catch((error) => {
        console.error("Floodgate SDK not ready:", error);
      });
  }, []);

  return null;
};

export default FeedbackHandler;
