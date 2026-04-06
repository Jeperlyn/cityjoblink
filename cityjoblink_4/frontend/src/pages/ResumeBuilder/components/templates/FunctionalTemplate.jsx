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

export default function FunctionalTemplate({ personalInfo = {}, experiences = [], education = [], skills = [], photo }) {
  const filledExperiences = (experiences || []).filter((e) => e.jobTitle || e.company);
  const filledEducation = (education || []).filter((e) => e.school || e.degree);
  const filledSkills = (skills || []).filter((s) => s.name.trim());

  return (
    <Card className="border-0 shadow-lg bg-white h-full print:shadow-none">
      <CardContent className="p-0">
        <div className="grid grid-cols-4 gap-0 print:grid-cols-4">
          <div className="col-span-1 bg-gray-100 p-6 print:p-4 space-y-6 print:space-y-4">
            {photo && <img src={photo} alt="Profile" className="w-32 h-32 rounded object-cover mx-auto border-2 border-gray-400 print:w-24 print:h-24" />}
            
            {filledSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 print:text-xs">SKILLS</h3>
                <div className="space-y-2 print:space-y-1">
                  {filledSkills.map((skill) => <div key={skill.id} className="text-xs text-gray-700 bg-white px-2 py-1 rounded">{skill.name}</div>)}
                </div>
              </div>
            )}

            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 print:text-xs">CONTACT</h3>
                <p className="text-xs text-gray-700 break-all">{personalInfo.email}</p>
                <p className="text-xs text-gray-700">{personalInfo.phone}</p>
                <p className="text-xs text-gray-700">{personalInfo.location}</p>
            </div>
          </div>

          <div className="col-span-3 p-8 print:p-4 space-y-6 print:space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1 print:text-2xl">{buildFullName(personalInfo) || "Your Name"}</h1>
              <div className="h-0.5 bg-gray-400 w-16"></div>
            </div>

            {personalInfo.summary && <div><p className="text-gray-700 text-sm leading-relaxed">{personalInfo.summary}</p></div>}

            {filledExperiences.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-400">EXPERIENCE</h2>
                <div className="space-y-4">
                  {filledExperiences.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-gray-700 font-medium text-sm mb-1">{exp.company} | {exp.startDate && formatDate(exp.startDate)}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filledEducation.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-400">EDUCATION</h2>
                {filledEducation.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                    <p className="text-gray-700 font-medium text-sm">{edu.degree}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

