import React, { forwardRef } from "react";

// Imports ng mga Templates na ginawa natin
import ModernTemplate from "../templates/ModernTemplate";
import ClassicTemplate from "../templates/ClassicTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import FunctionalTemplate from "../templates/FunctionalTemplate";

const ResumePreview = forwardRef(
  ({ template, personalInfo, experiences, education, skills, photo }, ref) => {
    
    // I-bundle lahat ng data para malinis ipasa
    const templateProps = {
      personalInfo,
      experiences,
      education,
      skills,
      photo,
    };

    // Logic kung anong template ang irerender
    const renderTemplate = () => {
      switch (template) {
        case "modern":
          return <ModernTemplate {...templateProps} />;
        case "classic":
          return <ClassicTemplate {...templateProps} />;
        case "creative":
          return <CreativeTemplate {...templateProps} />;
        case "minimal":
          return <MinimalTemplate {...templateProps} />;
        case "functional":
          return <FunctionalTemplate {...templateProps} />;
        default:
          return <ModernTemplate {...templateProps} />;
      }
    };

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div
          ref={ref}
          className="w-full bg-white rounded-lg shadow-xl overflow-hidden"
          style={{
            // Ginagaya nito ang sukat ng Bond Paper (Letter Size)
            aspectRatio: "8.5 / 11",
            backgroundColor: "white",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            maxWidth: "100%",
            height: "auto",
          }}
          id="resume-preview"
        >
          {renderTemplate()}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;