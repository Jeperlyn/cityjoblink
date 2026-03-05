import React, { useRef, useState, useEffect } from "react";
import { Trash2, Plus, Download, ChevronLeft, Upload } from "lucide-react";

// UI Components
// Note: Siguraduhing nagawa mo na ang mga file na ito sa components/ui folder
import { Button } from "./components/ui/button.jsx";
import { Input } from "./components/ui/input.jsx";
import { Textarea } from "./components/ui/textarea.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.jsx";
import ResumePreview from "./components/ui/ResumePreview.jsx";

export default function ResumeBuilderMain({ onBack, user, onSaveResume }) {
  const fileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const resumePreviewRef = useRef(null);

  const [template, setTemplate] = useState("modern");
  const [photo, setPhoto] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [showPhotoUrl, setShowPhotoUrl] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });


  useEffect(() => {
    if (user) {
      // Split name logic (Simple split by space)
      const nameParts = user.name ? user.name.split(" ") : [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      setPersonalInfo((prev) => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: user.email || "",
        phone: user.contact || "",
        location: user.address || "",
        summary: user.bio || ""
      }));
    }
  }, [user]);

  const [experiences, setExperiences] = useState([
    {
      id: "1",
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: "1",
      school: "",
      degree: "",
      field: "",
      graduationDate: "",
      description: "",
    },
  ]);

  const [skills, setSkills] = useState([
    { id: "1", name: "" },
    { id: "2", name: "" },
    { id: "3", name: "" },
  ]);

  // --- HANDLERS ---

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoUrl("");
        setShowPhotoUrl(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto("");
    setPhotoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('word') && file.type !== 'application/msword') {
        alert('Only PDF and Word documents allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeFile({ name: file.name, data: reader.result, type: file.type });
        setUploadedResume(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setUploadedResume(null);
    if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
  };

  const handleSaveResume = () => {
    if (onSaveResume && resumeFile) {
      onSaveResume({ resumeFile: resumeFile.name, resumeData: resumeFile.data, resumeType: resumeFile.type });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Experience Logic
  const updateExperience = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    if (experiences.length > 1) {
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  // Education Logic
  const updateEducation = (id, field, value) => {
    setEducation((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        school: "",
        degree: "",
        field: "",
        graduationDate: "",
        description: "",
      },
    ]);
  };

  const removeEducation = (id) => {
    if (education.length > 1) {
      setEducation((prev) => prev.filter((edu) => edu.id !== id));
    }
  };

  // Skills Logic
  const updateSkill = (id, value) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, name: value } : skill))
    );
  };

  const addSkill = () => {
    setSkills((prev) => [...prev, { id: Date.now().toString(), name: "" }]);
  };

  const removeSkill = (id) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  // PDF Download Logic
  const handleDownload = async () => {
    const element = resumePreviewRef.current;
    if (!element) return;

    try {
      // Check if html2pdf is loaded
      if (!window.html2pdf) {
        // Load script dynamically if missing
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => generatePDF(element);
        document.head.appendChild(script);
      } else {
        generatePDF(element);
      }
    } catch (error) {
      console.error("Failed to download resume:", error);
      alert("Failed to download. Please try again.");
    }
  };

  const generatePDF = (element) => {
    const opt = {
      margin: 0,
      filename: `Resume_${personalInfo.firstName || "My"}_${personalInfo.lastName || "Resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { format: "letter", orientation: "portrait" },
    };
    window.html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ BACK BUTTON: Dito tinatawag ang onBack function */}
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 hover:bg-gray-100 rounded-full p-2">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-xs text-gray-500">Create your resume in minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            {resumeFile && (
              <>
                {saveSuccess && <span className="text-xs font-bold text-green-600">✓ Saved</span>}
                <Button onClick={handleSaveResume} variant="default" size="sm" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Resume</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT SIDE: Editor Forms */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Upload Resume Section */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-lg text-gray-900">Upload Existing Resume</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!resumeFile ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Upload your existing resume (PDF or Word) for employers to assess</p>
                    <button
                      onClick={() => resumeFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-600 hover:bg-blue-100/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <p className="font-semibold text-gray-700">Click to upload resume</p>
                      <p className="text-xs text-gray-500">PDF or Word (.doc, .docx)</p>
                    </button>
                    <input
                      ref={resumeFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-green-200 border-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                          <span className="font-bold text-green-700">📄</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 truncate">{resumeFile.name}</p>
                          <p className="text-xs text-green-600">Ready to save</p>
                        </div>
                      </div>
                      <button
                        onClick={removeResume}
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Template Selector */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-lg text-gray-900">Choose Template</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {["modern", "classic", "creative", "minimal", "functional"].map((tmpl) => (
                    <button
                      key={tmpl}
                      onClick={() => setTemplate(tmpl)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        template === tmpl
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-lg text-gray-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                  {photo ? (
                    <div className="flex items-center gap-4">
                      <img src={photo} alt="Profile" className="w-24 h-24 rounded-lg object-cover border-2 border-blue-200" />
                      <div className="space-y-2">
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">Change Photo</Button>
                        <Button onClick={removePhoto} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">Upload Photo</Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input value={personalInfo.firstName} onChange={(e) => updatePersonalInfo("firstName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input value={personalInfo.lastName} onChange={(e) => updatePersonalInfo("lastName", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" value={personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input value={personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input value={personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                  <Textarea value={personalInfo.summary} onChange={(e) => updatePersonalInfo("summary", e.target.value)} className="min-h-24" />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-blue-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Work Experience</CardTitle>
                <Button onClick={addExperience} size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Job Title</label>
                        <Input value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company</label>
                        <Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                        <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">End Date</label>
                        <Input type="month" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} disabled={exp.currentlyWorking} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input type="checkbox" checked={exp.currentlyWorking} onChange={(e) => updateExperience(exp.id, "currentlyWorking", e.target.checked)} className="w-4 h-4" />
                      <label className="text-sm text-gray-700">Currently working here</label>
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} className="min-h-20" />
                    </div>
                    {experiences.length > 1 && (
                      <Button onClick={() => removeExperience(exp.id)} variant="ghost" size="sm" className="mt-4 text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-blue-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Education</CardTitle>
                <Button onClick={addEducation} size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">School</label>
                        <Input value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Degree</label>
                        <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Field of Study</label>
                        <Input value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Graduation Date</label>
                        <Input type="month" value={edu.graduationDate} onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium text-gray-700">Additional Info</label>
                      <Textarea value={edu.description} onChange={(e) => updateEducation(edu.id, "description", e.target.value)} className="min-h-20" />
                    </div>
                    {education.length > 1 && (
                      <Button onClick={() => removeEducation(edu.id)} variant="ghost" size="sm" className="mt-4 text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-blue-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Skills</CardTitle>
                <Button onClick={addSkill} size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Add Skill</Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2 group">
                      <Input placeholder="e.g. React" value={skill.name} onChange={(e) => updateSkill(skill.id, e.target.value)} />
                      {skills.length > 1 && (
                        <Button onClick={() => removeSkill(skill.id)} variant="ghost" size="sm" className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDE: Live Preview */}
          <div className="lg:col-span-2 h-[calc(100vh-120px)]">
            <div className="sticky top-24 h-full overflow-y-auto">
              <div className="flex justify-center py-4 px-2">
                <div className="w-full">
                  <ResumePreview
                    ref={resumePreviewRef}
                    template={template}
                    personalInfo={personalInfo}
                    experiences={experiences}
                    education={education}
                    skills={skills}
                    photo={photo}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

