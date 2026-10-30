// data/employer_data/employer_data.jsx

export const initialJobList = [
  {
    id: "1",
    title: "Senior UI/UX Designer",
    position: "Full-Time",
    companyName: "BrioSoft Solutions",
    salary: "$42k - $48k / mo",
    status: "open", // open or close
    applicantsCount: 5,
    description: "We are looking for an experienced UI/UX designer to craft intuitive digital experiences for mobile and web apps using modern design systems.",
    requirements: "Bachelor's degree in IT, Computer Science, or related field. Minimum 2 years of product design experience.",
    skillRequirements: "Figma, React Native UI, Design Systems, User Research"
  },
  {
    id: "2",
    title: "React Native Developer",
    position: "Contract",
    companyName: "BrioSoft Solutions",
    salary: "$35k - $40k / mo",
    status: "open",
    applicantsCount: 3,
    description: "Seeking a mobile developer skilled in Expo and React Native to build cross-platform features and connect RESTful backend APIs.",
    requirements: "Proficiency in JavaScript/TypeScript, React Native, and mobile navigation architectures.",
    skillRequirements: "React Native, Expo Router, REST APIs, Git"
  }
];

export const initialApplicants = [
  {
    id: "app-1",
    jobId: "1", // Linked to job id 1
    applicantName: "Joshua Diaz",
    applicantID: "EMP-2026-001",
    date_applied: "2026-10-24",
    application_message: "Hi team, I am very excited to apply for this role. I have extensive experience building full-stack mobile apps.",
    attached_files: "Joshua_Diaz_Resume.pdf",
    status: "pending", // pending, accepted, rejected
    reply_from_employer: ""
  },
  {
    id: "app-2",
    jobId: "1",
    applicantName: "Maria Santos",
    applicantID: "EMP-2026-002",
    date_applied: "2026-10-25",
    application_message: "Attached is my portfolio showcasing mobile UI/UX dashboards and design systems.",
    attached_files: "Maria_Santos_Portfolio.pdf",
    status: "pending",
    reply_from_employer: ""
  }
];