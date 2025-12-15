// frontend/src/data/mockData.js

export const ADMIN_ACCOUNT = {
    id: 1,
    name: "Admin User",
    email: "admin@cityjoblink.com",
    role: "Admin",
    password: "password123"
};

export const INITIAL_JOBS = [
    {
        id: 101,
        title: "Frontend Developer",
        company: "Tech Solutions Inc.",
        location: "Quezon City",
        type: "Full-time",
        salary: "PHP 30,000 - 40,000",
        posted: "2 days ago",
        description: "We are looking for a skilled Frontend Developer to join our team...",
        requiredSkills: ["React", "JavaScript", "CSS", "HTML"],
        employerId: 2
    },
    {
        id: 102,
        title: "Customer Service Representative",
        company: "Global BPO",
        location: "Eastwood, QC",
        type: "Full-time",
        salary: "PHP 20,000 - 25,000",
        posted: "1 day ago",
        description: "Handle customer inquiries via phone and email...",
        requiredSkills: ["Communication", "English", "Typing"],
        employerId: 3
    }
];

export const INITIAL_TRAININGS = [
    {
        id: 201,
        title: "Basic Web Development Bootcamp",
        provider: "QC ICT Department",
        date: "Dec 10-12, 2024",
        slots: 50,
        registeredUsers: []
    }
];

export const INITIAL_JOB_FAIRS = [
    {
        id: 301,
        title: "Mega Job Fair 2024",
        location: "Quezon City Hall",
        date: "Dec 15, 2024",
        time: "8:00 AM - 5:00 PM",
        participants: [],
        image: "https://via.placeholder.com/400x200?text=Job+Fair"
    }
];

export const INITIAL_APPLICATIONS = [];
export const INITIAL_MESSAGES = [];
export const INITIAL_NOTIFICATIONS = [];

// ✅ Helper function to calculate match score
export const calculateMatchScore = (requiredSkills = [], userSkills = []) => {
    if (!requiredSkills || requiredSkills.length === 0) return { score: 100, matches: [] };
    if (!userSkills || userSkills.length === 0) return { score: 0, matches: [] };
  
    // Simple partial match logic
    const matches = requiredSkills.filter(skill => 
      userSkills.some(uSkill => uSkill && skill && uSkill.toLowerCase().includes(skill.toLowerCase()))
    );
  
    const score = Math.round((matches.length / requiredSkills.length) * 100);
    return { score, matches };
};