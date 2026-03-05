import React from "react";
import { Card, CardContent } from "../ui/card.jsx";

export default function ModernTemplate({ personalInfo = {}, experiences = [], education = [], skills = [] }) {
  return (
    <Card className="border-0 shadow-lg bg-white h-full print:shadow-none">
      <CardContent className="p-0">
        <div className="bg-blue-700 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">{personalInfo.firstName} {personalInfo.lastName}</h1>
          <div className="text-sm flex gap-4 flex-wrap">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {personalInfo.summary && <div><p>{personalInfo.summary}</p></div>}
          {experiences.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b pb-1">Experience</h2>
              {experiences.map((exp, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-bold">{exp.jobTitle}</h3>
                  <p className="text-blue-600 text-sm">{exp.company}</p>
                  <p className="text-xs text-gray-500">{exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}</p>
                  <p className="text-sm mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          )}
          {education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b pb-1">Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <h3 className="font-bold">{edu.school}</h3>
                  <p className="text-sm">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-gray-500">Graduated: {edu.graduationDate}</p>
                </div>
              ))}
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b pb-1">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{s.name}</span>)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

