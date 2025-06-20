// App.jsx
import React from "react";
import FeedbackHandler from "./components/FeedbackHandler";

function App() {
  const handleShowSurvey = () => {
    if (
      window.OfficeBrowserFeedback &&
      window.OfficeBrowserFeedback.floodgate &&
      typeof window.OfficeBrowserFeedback.floodgate.showCustomSurvey === "function"
    ) {
      window.OfficeBrowserFeedback.floodgate
        .showCustomSurvey({
          surveyId: "060986b2-6817-422f-bfa1-4aca1a53b439",
        })
        .then(() => console.log("Survey launched"))
        .catch((err) => console.error("Survey launch failed", err));
    } else {
      console.error("Floodgate not ready yet.");
    }
  };

  return (
    <>
      <FeedbackHandler />
      <h1>NPS to OCV Migration - React Application!</h1>
      <button onClick={handleShowSurvey}>Launch Feedback Survey</button>
    </>
  );
}

// ✅ Export the component
export default App;
