import React from "react";
// Import UI components (Adjust path if needed)
import { Card, CardContent } from "../ui/card";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const buildFullName = (personalInfo) => {
  if (!personalInfo) return "";
  const parts = [
    personalInfo.firstName,
    personalInfo.middleName,
    personalInfo.lastName,
    personalInfo.suffix,
  ].filter((part) => part?.trim());
  return parts.join(" ");
};

export default function ClassicTemplate({
  personalInfo = {},
  experiences = [],
  education = [],
  skills = [],
  photo,
}) {
  // Safety check: Filter only if array exists
  const filledExperiences = (experiences || []).filter(
    (e) => e.jobTitle || e.company
  );
  const filledEducation = (education || []).filter(
    (e) => e.school || e.degree
  );
  const filledSkills = (skills || []).filter((s) => s.name.trim());

  return (
    <Card className="border-0 shadow-lg bg-white h-full print:shadow-none">
      <CardContent className="p-0">
        <div className="p-8 print:p-6">
          {/* Header Section */}
          <div className="text-center mb-8 print:mb-6">
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-32 h-32 rounded-lg object-cover mx-auto mb-4 border-2 border-gray-900 print:w-24 print:h-24"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
              {buildFullName(personalInfo) || "Your Name"}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-gray-700 text-sm print:text-xs">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>•</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>•</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>
          </div>

          {/* Summary Section */}
          <div className="border-t-2 border-b-2 border-gray-900 py-2 mb-6 print:py-1.5 print:mb-4">
            {personalInfo.summary && (
              <p className="text-gray-700 text-sm leading-relaxed print:text-xs">
                {personalInfo.summary}
              </p>
            )}
          </div>

          {/* Work Experience Section */}
          {filledExperiences.length > 0 && (
            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-base print:mb-2">
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4 print:space-y-3">
                {filledExperiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-bold text-gray-900 print:text-sm">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-gray-600 text-sm print:text-xs">
                        {exp.startDate && formatDate(exp.startDate)}
                        {exp.startDate && exp.endDate && " - "}
                        {exp.endDate && formatDate(exp.endDate)}
                        {exp.startDate && exp.currentlyWorking && " - Present"}
                        {exp.startDate &&
                          !exp.endDate &&
                          !exp.currentlyWorking &&
                          " - Present"}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm font-semibold print:text-xs mb-1">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-gray-600 text-sm leading-relaxed print:text-xs">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {filledEducation.length > 0 && (
            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-base print:mb-2">
                EDUCATION
              </h2>
              <div className="space-y-4 print:space-y-3">
                {filledEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-bold text-gray-900 print:text-sm">
                        {edu.school}
                      </h3>
                      {edu.graduationDate && (
                        <span className="text-gray-600 text-sm print:text-xs">
                          {formatDate(edu.graduationDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm font-semibold print:text-xs">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    {edu.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mt-1 print:text-xs">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {filledSkills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-base print:mb-2">
                SKILLS
              </h2>
              <p className="text-gray-700 text-sm print:text-xs">
                {filledSkills.map((skill) => skill.name).join(" • ")}
              </p>
            </div>
          )}

          {/* Empty State / Prompt */}
          {!buildFullName(personalInfo) && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">
                Start filling in your information to see your resume preview
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}