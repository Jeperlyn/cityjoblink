export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const YEARS = Array.from({length: 50}, (_, i) => new Date().getFullYear() - i);

// Match Score Logic
export const calculateMatchScore = (jobSkills, userSkills) => {
  const safeSkills = userSkills || [];
  const cleanJobSkills = (jobSkills || []).filter(s => s && s.trim() !== "");
  if (!cleanJobSkills || cleanJobSkills.length === 0) return { score: 0, matches: [] };
  const matches = cleanJobSkills.filter(skill => 
      safeSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
  );
  const score = Math.round((matches.length / cleanJobSkills.length) * 100);
  return { score, matches };
};

export const ADMIN_ACCOUNT = { id: 999, name: "PESO Admin", email: "admin@peso.gov.ph", role: "Admin", password: "admin" };

// ✅ FIXED: Added ADMIN_ACCOUNT inside this list so you can log in
export const INITIAL_USERS = [
  ADMIN_ACCOUNT, // <--- This was missing!

  {
    id: 101, 
    name: "Telco HR",
    companyName: "Telco Ph",
    email: "hr@telco.ph",
    password: "123",
    role: "Employer",
    isVerified: true, 
    uploadedDocs: true
  },
  {
    id: 201,
    email: "chymechrsprdo@gmail.com", 
    password: "123",
    role: "Seeker",
    name: "Juan Dela Cruz",
    isVerified: true,
    skills: ["Customer Service", "English Proficiency"],
    education: [],
    experience: [],
    licenses: [],
    languages: [],
    uploadedDocs: false,
    resumeFile: "mock-resume.pdf"
  }
];

export const INITIAL_JOBS = [
  {
    id: 1,
    title: "Customer Service Manager",
    company: "Telco Solutions Inc.",
    location: "Quezon City, District 1",
    salary: "₱25k - ₱35k",
    type: "Full-time",
    industry: "BPO / Call Center",
    posted: "2 days ago",
    requiredSkills: ["Customer Service", "English Proficiency", "Management", "Problem Solving"],
    employerId: 101,
    description: "We are looking for an experienced Customer Service Manager...",
    status: "Open"
  },
  {
    id: 2,
    title: "Administrative Assistant",
    company: "QC Local Government",
    location: "Quezon City Hall",
    salary: "₱18k - ₱22k",
    type: "Contract",
    industry: "Government",
    posted: "1 day ago",
    requiredSkills: ["Microsoft Office", "Communication", "Organizing", "English Proficiency"],
    employerId: 102,
    description: "Responsible for handling clerical tasks in our office.",
    status: "Open"
  },
  {
    id: 3,
    title: "Junior Web Developer",
    company: "TechStar Startups",
    location: "Technohub, QC",
    salary: "₱30k - ₱45k",
    type: "Full-time",
    industry: "IT & Software",
    posted: "3 days ago",
    requiredSkills: ["JavaScript", "React", "HTML/CSS", "Problem Solving"],
    employerId: 103,
    description: "Building and maintaining websites. Collaborating with design teams.",
    status: "Open"
  }
];

export const INITIAL_TRAININGS = [
  { id: 1, title: "Basic English Proficiency", provider: "TESDA", date: "Oct 25 - Nov 25", slots: 50, type: "Online", description: "A comprehensive 4-week course.", registeredUsers: [] },
  { id: 2, title: "Call Center 101", provider: "QC Local Gov", date: "Nov 02 - Nov 05", slots: 30, type: "On-site", description: "Intensive training for aspiring agents.", registeredUsers: [] }
];

export const INITIAL_JOB_FAIRS = [
  { 
    id: 1, 
    title: "QC Mega Job Fair 2025", 
    location: "Quezon City Hall Quadrangle", 
    date: "Dec 05, 2025", 
    time: "8:00 AM - 5:00 PM",
    organizer: "PESO QC & DOLE", 
    description: "Join the largest local job fair...", 
    participants: [],
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop", 
    highlights: ["On-the-spot Hiring", "Free Resume Printing", "Career Coaching"],
    companies: ["SM Supermalls", "Telco Inc.", "Jollibee Foods", "Accenture", "QC LGU"]
  },
  { 
    id: 2, 
    title: "Tech & BPO Career Expo", 
    location: "Araneta Coliseum", 
    date: "Jan 15, 2026", 
    time: "10:00 AM - 6:00 PM",
    organizer: "TechPH", 
    description: "Looking for a career in Tech?...", 
    participants: [],
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop",
    highlights: ["Tech Talks", "Coding Challenges", "Networking"],
    companies: ["Google PH", "Canva", "TaskUs", "Concentrix"]
  }
];

export const INITIAL_APPLICATIONS = [
  { 
    id: 999, 
    jobId: 1,
    seekerId: 201,
    status: 'Pending', 
    date: '12/03/2025' 
  }
]; 

export const INITIAL_MESSAGES = [
  { id: 1, fromId: 0, toId: 201, senderName: "CityJobLink Bot", content: "Welcome to CityJobLink! Complete your profile to get matched.", date: "System", read: false }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, toId: 201, content: "Your job application for Admin Asst was viewed.", read: false, date: Date.now() - 300000 }, 
  { id: 2, toId: 201, content: "Your profile has been fully matched.", read: true, date: Date.now() - 86400000 }
];