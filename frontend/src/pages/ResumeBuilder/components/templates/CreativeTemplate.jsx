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

export default function CreativeTemplate({ personalInfo = {}, experiences = [], education = [], skills = [], photo }) {
  const filledExperiences = (experiences || []).filter((e) => e.jobTitle || e.company);
  const filledEducation = (education || []).filter((e) => e.school || e.degree);
  const filledSkills = (skills || []).filter((s) => s.name.trim());

  return (
    <Card className="border-0 shadow-lg bg-white h-full print:shadow-none">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-0 print:grid-cols-3">
          {/* Left Sidebar */}
          <div className="col-span-1 bg-slate-900 text-white p-6 print:p-4">
            {photo && <img src={photo} alt="Profile" className="w-32 h-32 rounded-xl object-cover mb-6 border-4 border-blue-400 print:w-24 print:h-24 print:mb-4" />}
            
            {personalInfo.email && <div className="mb-6"><h3 className="text-xs font-bold text-blue-300 mb-2">CONTACT</h3><p className="text-sm text-gray-300 break-all">{personalInfo.email}</p><p className="text-sm text-gray-300">{personalInfo.phone}</p><p className="text-sm text-gray-300">{personalInfo.location}</p></div>}

            {filledSkills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-blue-300 mb-3">SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {filledSkills.map((skill) => <span key={skill.id} className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">{skill.name}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="col-span-2 p-6 print:p-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{buildFullName(personalInfo) || "Your Name"}</h1>
              <div className="w-16 h-1 bg-blue-600"></div>
            </div>

            {personalInfo.summary && <div className="mb-8"><p className="text-gray-700 text-sm leading-relaxed">{personalInfo.summary}</p></div>}

            {filledExperiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-blue-600"></span>Work Experience</h2>
                <div className="space-y-4">
                  {filledExperiences.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-blue-300 pl-4">
                      <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-blue-600 text-sm font-semibold mb-1">{exp.company}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filledEducation.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-blue-600"></span>Education</h2>
                {filledEducation.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-blue-300 pl-4 mb-4">
                    <h3 className="font-bold text-gray-900">{edu.school}</h3>
                    <p className="text-blue-600 text-sm font-semibold">{edu.degree} in {edu.field}</p>
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

