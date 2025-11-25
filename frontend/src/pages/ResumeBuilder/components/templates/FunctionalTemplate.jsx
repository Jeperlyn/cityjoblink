import React from "react";
// Import UI components
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

export default function FunctionalTemplate({
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
        <div className="grid grid-cols-4 gap-0 print:grid-cols-4">
          {/* Sidebar (Left Column) - Gray Background */}
          <div className="col-span-1 bg-gray-100 p-6 print:p-4 space-y-6 print:space-y-4">
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-32 h-32 rounded object-cover mx-auto border-2 border-gray-400 print:w-24 print:h-24"
              />
            )}

            {/* Skills in Sidebar */}
            {filledSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 print:text-xs">
                  SKILLS
                </h3>
                <div className="space-y-2 print:space-y-1">
                  {filledSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="text-xs text-gray-700 bg-white px-2 py-1 rounded print:text-xs print:px-1 print:py-0.5"
                    >
                      {skill.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info in Sidebar */}
            {personalInfo.location && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 print:text-xs">
                  LOCATION
                </h3>
                <p className="text-xs text-gray-700 print:text-xs">
                  {personalInfo.location}
                </p>
              </div>
            )}

            {personalInfo.email && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 print:text-xs">
                  EMAIL
                </h3>
                <p className="text-xs text-gray-700 break-all print:text-xs">
                  {personalInfo.email}
                </p>
              </div>
            )}

            {personalInfo.phone && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 print:text-xs">
                  PHONE
                </h3>
                <p className="text-xs text-gray-700 print:text-xs">
                  {personalInfo.phone}
                </p>
              </div>
            )}
          </div>

          {/* Main Content (Right Column) */}
          <div className="col-span-3 p-8 print:p-4 space-y-6 print:space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1 print:text-2xl">
                {buildFullName(personalInfo) || "Your Name"}
              </h1>
              <div className="h-0.5 bg-gray-400 w-16"></div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div>
                <p className="text-gray-700 text-sm leading-relaxed print:text-xs">
                  {personalInfo.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {filledExperiences.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-400 print:text-base print:mb-2 print:pb-1">
                  EXPERIENCE
                </h2>
                <div className="space-y-4 print:space-y-3">
                  {filledExperiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 print:text-sm">
                          {exp.jobTitle}
                        </h3>
                        <span className="text-gray-600 text-sm print:text-xs">
                          {exp.startDate && formatDate(exp.startDate)}
                          {exp.startDate && exp.endDate && " - "}
                          {exp.endDate && formatDate(exp.endDate)}
                          {exp.startDate &&
                            exp.currentlyWorking &&
                            " - Present"}
                          {exp.startDate &&
                            !exp.endDate &&
                            !exp.currentlyWorking &&
                            " - Present"}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium text-sm print:text-xs mb-1">
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

            {/* Education */}
            {filledEducation.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-400 print:text-base print:mb-2 print:pb-1">
                  EDUCATION
                </h2>
                <div className="space-y-4 print:space-y-3">
                  {filledEducation.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 print:text-sm">
                          {edu.school}
                        </h3>
                        {edu.graduationDate && (
                          <span className="text-gray-600 text-sm print:text-xs">
                            {formatDate(edu.graduationDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium text-sm print:text-xs">
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

            {/* Empty State Prompt */}
            {!buildFullName(personalInfo) && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  Start filling in your information to see your resume preview
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}