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

export default function CreativeTemplate({
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
        <div className="grid grid-cols-3 gap-0 print:grid-cols-3">
          {/* Left Sidebar (Dark Blue) */}
          <div className="col-span-1 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 print:p-4">
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-32 h-32 rounded-xl object-cover mb-6 border-4 border-blue-400 print:w-24 print:h-24 print:mb-4"
              />
            )}

            {personalInfo.location && (
              <div className="mb-6 print:mb-4">
                <h3 className="text-xs font-bold text-blue-300 mb-2">
                  LOCATION
                </h3>
                <p className="text-sm text-gray-300 print:text-xs">
                  {personalInfo.location}
                </p>
              </div>
            )}

            {personalInfo.email && (
              <div className="mb-6 print:mb-4">
                <h3 className="text-xs font-bold text-blue-300 mb-2">EMAIL</h3>
                <p className="text-sm text-gray-300 break-all print:text-xs">
                  {personalInfo.email}
                </p>
              </div>
            )}

            {personalInfo.phone && (
              <div className="mb-6 print:mb-4">
                <h3 className="text-xs font-bold text-blue-300 mb-2">PHONE</h3>
                <p className="text-sm text-gray-300 print:text-xs">
                  {personalInfo.phone}
                </p>
              </div>
            )}

            {filledSkills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-blue-300 mb-3">SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {filledSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium print:px-1.5 print:py-0.5"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="col-span-2 p-6 print:p-4">
            <div className="mb-8 print:mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 print:text-2xl">
                {buildFullName(personalInfo) || "Your Name"}
              </h1>
              <div className="w-16 h-1 bg-blue-600 print:h-0.5"></div>
            </div>

            {personalInfo.summary && (
              <div className="mb-8 print:mb-6">
                <p className="text-gray-700 text-sm leading-relaxed print:text-xs">
                  {personalInfo.summary}
                </p>
              </div>
            )}

            {filledExperiences.length > 0 && (
              <div className="mb-8 print:mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-base print:mb-3">
                  <span className="w-1 h-6 bg-blue-600"></span>
                  Work Experience
                </h2>
                <div className="space-y-4 print:space-y-3">
                  {filledExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 border-blue-300 pl-4"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-bold text-gray-900 print:text-sm">
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
                      <p className="text-blue-600 text-sm font-semibold print:text-xs mb-1">
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
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-base print:mb-3">
                  <span className="w-1 h-6 bg-blue-600"></span>
                  Education
                </h2>
                <div className="space-y-4 print:space-y-3">
                  {filledEducation.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 border-blue-300 pl-4"
                    >
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
                      <p className="text-blue-600 text-sm font-semibold print:text-xs">
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