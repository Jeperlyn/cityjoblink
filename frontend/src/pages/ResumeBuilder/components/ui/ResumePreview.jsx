import React, { forwardRef } from "react";

// Import lahat ng templates na ginawa mo
import ModernTemplate from "../templates/ModernTemplate.jsx";
import ClassicTemplate from "../templates/ClassicTemplate.jsx";
import CreativeTemplate from "../templates/CreativeTemplate.jsx";
import MinimalTemplate from "../templates/MinimalTemplate.jsx";
import FunctionalTemplate from "../templates/FunctionalTemplate.jsx";

const ResumePreview = forwardRef(({ template, ...props }, ref) => {
  
  // Ito ang "Switch Logic" na nawala kanina
  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate {...props} />;
      case "classic":
        return <ClassicTemplate {...props} />;
      case "creative":
        return <CreativeTemplate {...props} />;
      case "minimal":
        return <MinimalTemplate {...props} />;
      case "functional":
        return <FunctionalTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
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
        {/* Dito tinatawag ang napiling template */}
        {renderTemplate()}
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;