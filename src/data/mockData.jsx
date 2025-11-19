// src/data/mockData.jsx

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const YEARS = Array.from({length: 50}, (_, i) => new Date().getFullYear() - i);

export const calculateMatchScore = (jobSkills, userSkills) => {
  const safeSkills = userSkills || [];
  if (!jobSkills || !userSkills || jobSkills.length === 0) return { score: 0, matches: [] };
  const matches = jobSkills.filter(skill => safeSkills.some(us => us.toLowerCase().includes(skill.toLowerCase())));
  const score = Math.round((matches.length / jobSkills.length) * 100);
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

export const INITIAL_JOB_FAIRS = [
  { id: 1, title: "Mega Job Fair 2025", location: "QC Hall Quadrangle", date: "Dec 05, 2025", organizer: "PESO QC", description: "Join over 50 companies.", participants: [] }
];

export const INITIAL_APPLICATIONS = []; 

export const INITIAL_MESSAGES = [
  { id: 1, fromId: 0, toId: 201, senderName: "CityJobLink Bot", content: "Welcome to CityJobLink! Complete your profile to get matched.", date: "System", read: false }
];