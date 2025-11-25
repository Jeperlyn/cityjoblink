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

export default function ModernTemplate({
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 print:p-6">
          <div className="flex gap-6 items-start">
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white print:w-20 print:h-20"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 print:text-2xl">
                {buildFullName(personalInfo) || "Your Name"}
              </h1>
              <div className="flex flex-wrap gap-4 text-blue-100 text-sm print:text-xs">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 print:p-6 space-y-6 print:space-y-4">
          {personalInfo.summary && (
            <div>
              <p className="text-gray-700 text-sm leading-relaxed print:text-xs">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {filledExperiences.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600 print:text-base print:mb-2">
                Work Experience
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
                        {exp.startDate && exp.currentlyWorking && " - Present"}
                        {exp.startDate &&
                          !exp.endDate &&
                          !exp.currentlyWorking &&
                          " - Present"}
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm font-medium print:text-xs mb-2">
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

          {filledEducation.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600 print:text-base print:mb-2">
                Education
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
                    <p className="text-blue-600 text-sm font-medium print:text-xs">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    {edu.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mt-2 print:text-xs">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filledSkills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600 print:text-base print:mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {filledSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium print:text-xs print:px-2 print:py-0.5"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

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