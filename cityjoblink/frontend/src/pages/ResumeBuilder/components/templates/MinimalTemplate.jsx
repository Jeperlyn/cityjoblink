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
  const parts = [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName, personalInfo.suffix].filter((part) => part?.trim());
  return parts.join(" ");
};

export default function MinimalTemplate({ personalInfo = {}, experiences = [], education = [], skills = [], photo }) {
  const filledExperiences = (experiences || []).filter((e) => e.jobTitle || e.company);
  const filledEducation = (education || []).filter((e) => e.school || e.degree);
  const filledSkills = (skills || []).filter((s) => s.name.trim());

  return (
    <Card className="border-0 shadow-lg bg-white h-full print:shadow-none">
      <CardContent className="p-0">
        <div className="p-10 print:p-6 space-y-5 print:space-y-3">
          <div className="flex items-start gap-6 print:gap-4">
            {photo && <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover flex-shrink-0 print:w-16 print:h-16" />}
            <div className="flex-1">
              <h1 className="text-2xl font-light text-gray-900 print:text-xl">{buildFullName(personalInfo) || "Your Name"}</h1>
              <div className="text-xs text-gray-600 space-y-0.5 mt-2 print:text-xs">
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.location && <div>{personalInfo.location}</div>}
              </div>
            </div>
          </div>

          {personalInfo.summary && <div><p className="text-gray-700 text-xs leading-relaxed print:text-xs">{personalInfo.summary}</p></div>}

          {filledExperiences.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3 print:text-xs">Experience</h2>
              <div className="space-y-3 print:space-y-2">
                {filledExperiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 print:text-xs">{exp.jobTitle}</h3>
                      <span className="text-xs text-gray-600 print:text-xs">{exp.startDate && formatDate(exp.startDate)} - {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}</span>
                    </div>
                    <p className="text-xs text-gray-700 print:text-xs mb-1">{exp.company}</p>
                    <p className="text-xs text-gray-600 leading-relaxed print:text-xs">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filledEducation.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3 print:text-xs">Education</h2>
              {filledEducation.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 print:text-xs">{edu.school}</h3>
                    <span className="text-xs text-gray-600 print:text-xs">{formatDate(edu.graduationDate)}</span>
                  </div>
                  <p className="text-xs text-gray-700 print:text-xs">{edu.degree} in {edu.field}</p>
                </div>
              ))}
            </div>
          )}

          {filledSkills.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2 print:text-xs">Skills</h2>
              <p className="text-xs text-gray-700 print:text-xs">{filledSkills.map((skill) => skill.name).join(" • ")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}