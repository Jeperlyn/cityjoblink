// src/data/mockData.jsx

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const YEARS = Array.from({length: 50}, (_, i) => new Date().getFullYear() - i);

// 👇 FIX: Updated Logic para hindi mag-100% ang walang skills
export const calculateMatchScore = (jobSkills, userSkills) => {
  const safeSkills = userSkills || [];
  
  // Tanggalin ang mga blankong skills o spaces lang
  const cleanJobSkills = jobSkills.filter(s => s && s.trim() !== "");

  // Kung walang valid requirement, 0% match
  if (!cleanJobSkills || cleanJobSkills.length === 0) return { score: 0, matches: [] };

  const matches = cleanJobSkills.filter(skill => 
      safeSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
  );

  const score = Math.round((matches.length / cleanJobSkills.length) * 100);
  return { score, matches };
};

export const ADMIN_ACCOUNT = { id: 999, name: "PESO Admin", email: "admin@peso.gov.ph", role: "Admin", password: "admin" };

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
    description: "We are looking for an experienced Customer Service Manager to provide excellent customer service and to promote this idea throughout the organization.",
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

// 👇 UPDATED: Added images, time, and highlights for the new design
export const INITIAL_JOB_FAIRS = [
  { 
    id: 1, 
    title: "QC Mega Job Fair 2025", 
    location: "Quezon City Hall Quadrangle", 
    date: "Dec 05, 2025", 
    time: "8:00 AM - 5:00 PM",
    organizer: "PESO QC & DOLE", 
    description: "Join the largest local job fair featuring over 50 registered companies across various industries including BPO, IT, Retail, and Manufacturing. Bring multiple copies of your resume.", 
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
    description: "Looking for a career in Tech? Meet the biggest startups and BPO companies in the country. Open for fresh graduates and experienced professionals.", 
    participants: [],
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop",
    highlights: ["Tech Talks", "Coding Challenges", "Networking"],
    companies: ["Google PH", "Canva", "TaskUs", "Concentrix"]
  }
];

export const INITIAL_APPLICATIONS = []; 

export const INITIAL_MESSAGES = [
  { id: 1, fromId: 0, toId: 201, senderName: "CityJobLink Bot", content: "Welcome to CityJobLink! Complete your profile to get matched.", date: "System", read: false }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, toId: 201, content: "Your job application for Admin Asst was viewed.", read: false, date: Date.now() - 300000 }, 
  { id: 2, toId: 201, content: "Your profile has been fully matched.", read: true, date: Date.now() - 86400000 }, 
];