import React from "react";
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

export default function MinimalTemplate({
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
        <div className="p-10 print:p-6 space-y-5 print:space-y-3">
          {/* Header */}
          <div className="flex items-start gap-6 print:gap-4">
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover flex-shrink-0 print:w-16 print:h-16"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-light text-gray-900 print:text-xl">
                {buildFullName(personalInfo) || "Your Name"}
              </h1>
              <div className="text-xs text-gray-600 space-y-0.5 mt-2 print:text-xs">
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.location && <div>{personalInfo.location}</div>}
              </div>
            </div>
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <div>
              <p className="text-gray-700 text-xs leading-relaxed print:text-xs">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {filledExperiences.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3 print:text-xs">
                Experience
              </h2>
              <div className="space-y-3 print:space-y-2">
                {filledExperiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 print:text-xs">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-600 print:text-xs">
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
                    <p className="text-xs text-gray-700 print:text-xs mb-1">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 leading-relaxed print:text-xs">
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
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3 print:text-xs">
                Education
              </h2>
              <div className="space-y-3 print:space-y-2">
                {filledEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 print:text-xs">
                        {edu.school}
                      </h3>
                      {edu.graduationDate && (
                        <span className="text-xs text-gray-600 print:text-xs">
                          {formatDate(edu.graduationDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 print:text-xs">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    {edu.description && (
                      <p className="text-xs text-gray-600 leading-relaxed mt-1 print:text-xs">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {filledSkills.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2 print:text-xs">
                Skills
              </h2>
              <p className="text-xs text-gray-700 print:text-xs">
                {filledSkills.map((skill) => skill.name).join(" • ")}
              </p>
            </div>
          )}

          {/* Empty State */}
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