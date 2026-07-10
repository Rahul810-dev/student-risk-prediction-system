export const students = [
  {
    id: 1,
    rollNo: "CS2021001",
    name: "Aarav Sharma",
    email: "aarav.sharma@university.edu",
    department: "Computer Science",
    year: 3,
    academicYear: "2021–22",
    mentor: "Dr. Ramesh Kumar",
    cgpa: 8.7,
    prevGpa: 8.4,
    attendance: 91,
    consecutiveAbsences: 1,
    backlogs: 0,
    riskLevel: "Low",
    phone: "+91 98765 43210",
    address: "12, MG Road, Bangalore",
    risk: { cgpa: 10, backlog: 5, attendance: 12, assignment: 8, overall: 9 },
    attendanceTrend: [92, 95, 89, 91, 93, 91],
    gpaHistory: [8.1, 8.3, 8.4, 8.7],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-02-10", to: "2024-02-11", days: 2, status: "Approved" },
      { type: "Personal Leave", from: "2024-04-05", to: "2024-04-05", days: 1, status: "Approved" },
    ],
    examScores: [{ subject: "DS", marks: 88 }, { subject: "DBMS", marks: 91 }, { subject: "OS", marks: 85 }, { subject: "CN", marks: 90 }, { subject: "SE", marks: 87 }],
    assignments: { submitted: 18, total: 20, percentage: 90 },
    awards: ["Best Coder 2023", "Hackathon Winner 2024"],
    activities: ["Coding Club", "Cricket Team"],
  },
  {
    id: 2,
    rollNo: "CS2021002",
    name: "Priya Patel",
    email: "priya.patel@university.edu",
    department: "Computer Science",
    year: 3,
    academicYear: "2021–22",
    mentor: "Dr. Ramesh Kumar",
    cgpa: 6.2,
    prevGpa: 6.8,
    attendance: 63,
    consecutiveAbsences: 7,
    backlogs: 3,
    riskLevel: "High",
    phone: "+91 87654 32109",
    address: "45, Nehru Nagar, Pune",
    risk: { cgpa: 72, backlog: 85, attendance: 88, assignment: 65, overall: 78 },
    attendanceTrend: [75, 68, 60, 58, 62, 63],
    gpaHistory: [7.2, 7.0, 6.8, 6.2],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-01-15", to: "2024-01-19", days: 5, status: "Approved" },
      { type: "Personal Leave", from: "2024-03-10", to: "2024-03-12", days: 3, status: "Pending" },
      { type: "On Duty", from: "2024-04-20", to: "2024-04-20", days: 1, status: "Approved" },
    ],
    examScores: [{ subject: "DS", marks: 52 }, { subject: "DBMS", marks: 48 }, { subject: "OS", marks: 55 }, { subject: "CN", marks: 50 }, { subject: "SE", marks: 59 }],
    assignments: { submitted: 11, total: 20, percentage: 55 },
    awards: [],
    activities: ["Drama Club"],
  },
  {
    id: 3,
    rollNo: "EC2022001",
    name: "Rohan Mehta",
    email: "rohan.mehta@university.edu",
    department: "Electronics",
    year: 2,
    academicYear: "2022–23",
    mentor: "Dr. Sunita Rao",
    cgpa: 7.5,
    prevGpa: 7.3,
    attendance: 78,
    consecutiveAbsences: 3,
    backlogs: 1,
    riskLevel: "Medium",
    phone: "+91 76543 21098",
    address: "7, Saket, New Delhi",
    risk: { cgpa: 35, backlog: 45, attendance: 48, assignment: 30, overall: 40 },
    attendanceTrend: [82, 80, 76, 74, 78, 78],
    gpaHistory: [7.0, 7.2, 7.3, 7.5],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-02-20", to: "2024-02-22", days: 3, status: "Approved" },
      { type: "On Duty", from: "2024-03-15", to: "2024-03-15", days: 1, status: "Approved" },
    ],
    examScores: [{ subject: "Circuits", marks: 72 }, { subject: "Signals", marks: 75 }, { subject: "EMF", marks: 68 }, { subject: "Digital", marks: 80 }, { subject: "VLSI", marks: 71 }],
    assignments: { submitted: 15, total: 20, percentage: 75 },
    awards: ["Technical Poster Award 2023"],
    activities: ["Robotics Club", "Football Team"],
  },
  {
    id: 4,
    rollNo: "ME2020001",
    name: "Sneha Reddy",
    email: "sneha.reddy@university.edu",
    department: "Mechanical",
    year: 4,
    academicYear: "2020–21",
    mentor: "Prof. Anil Verma",
    cgpa: 9.1,
    prevGpa: 8.9,
    attendance: 95,
    consecutiveAbsences: 0,
    backlogs: 0,
    riskLevel: "Low",
    phone: "+91 65432 10987",
    address: "88, Banjara Hills, Hyderabad",
    risk: { cgpa: 5, backlog: 2, attendance: 5, assignment: 4, overall: 4 },
    attendanceTrend: [94, 96, 95, 97, 95, 95],
    gpaHistory: [8.5, 8.7, 8.9, 9.1],
    leaveHistory: [
      { type: "On Duty", from: "2024-01-25", to: "2024-01-26", days: 2, status: "Approved" },
    ],
    examScores: [{ subject: "Thermo", marks: 92 }, { subject: "Fluid", marks: 90 }, { subject: "Manufacturing", marks: 95 }, { subject: "Design", marks: 91 }, { subject: "CAD", marks: 93 }],
    assignments: { submitted: 20, total: 20, percentage: 100 },
    awards: ["Gold Medal 2023", "Best Project Award", "University Topper"],
    activities: ["NSS", "Badminton Team"],
  },
  {
    id: 5,
    rollNo: "CE2022002",
    name: "Arjun Singh",
    email: "arjun.singh@university.edu",
    department: "Civil",
    year: 2,
    academicYear: "2022–23",
    mentor: "Dr. Priya Menon",
    cgpa: 5.8,
    prevGpa: 6.1,
    attendance: 58,
    consecutiveAbsences: 12,
    backlogs: 5,
    riskLevel: "High",
    phone: "+91 54321 09876",
    address: "33, Connaught Place, New Delhi",
    risk: { cgpa: 85, backlog: 92, attendance: 95, assignment: 80, overall: 90 },
    attendanceTrend: [70, 65, 60, 55, 58, 58],
    gpaHistory: [6.5, 6.3, 6.1, 5.8],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-01-08", to: "2024-01-15", days: 8, status: "Approved" },
      { type: "Personal Leave", from: "2024-02-14", to: "2024-02-18", days: 5, status: "Rejected" },
      { type: "Personal Leave", from: "2024-03-20", to: "2024-03-25", days: 6, status: "Pending" },
    ],
    examScores: [{ subject: "Structures", marks: 44 }, { subject: "Geotech", marks: 50 }, { subject: "Survey", marks: 48 }, { subject: "Concrete", marks: 45 }, { subject: "Transport", marks: 52 }],
    assignments: { submitted: 9, total: 20, percentage: 45 },
    awards: [],
    activities: [],
  },
  {
    id: 6,
    rollNo: "IT2021003",
    name: "Kavya Nair",
    email: "kavya.nair@university.edu",
    department: "Information Technology",
    year: 3,
    academicYear: "2021–22",
    mentor: "Dr. Lakshmi Iyer",
    cgpa: 8.2,
    prevGpa: 7.9,
    attendance: 86,
    consecutiveAbsences: 2,
    backlogs: 0,
    riskLevel: "Low",
    phone: "+91 43210 98765",
    address: "15, Indiranagar, Bangalore",
    risk: { cgpa: 18, backlog: 10, attendance: 22, assignment: 15, overall: 16 },
    attendanceTrend: [88, 85, 84, 87, 86, 86],
    gpaHistory: [7.5, 7.7, 7.9, 8.2],
    leaveHistory: [
      { type: "On Duty", from: "2024-02-05", to: "2024-02-06", days: 2, status: "Approved" },
      { type: "Sick Leave", from: "2024-04-10", to: "2024-04-11", days: 2, status: "Approved" },
    ],
    examScores: [{ subject: "Web Tech", marks: 83 }, { subject: "Cloud", marks: 88 }, { subject: "Security", marks: 80 }, { subject: "AI", marks: 85 }, { subject: "ML", marks: 82 }],
    assignments: { submitted: 17, total: 20, percentage: 85 },
    awards: ["Best Paper Presentation 2024"],
    activities: ["Coding Club", "Cultural Committee"],
  },
  {
    id: 7,
    rollNo: "EC2021002",
    name: "Vikram Gupta",
    email: "vikram.gupta@university.edu",
    department: "Electronics",
    year: 3,
    academicYear: "2021–22",
    mentor: "Dr. Sunita Rao",
    cgpa: 6.9,
    prevGpa: 7.2,
    attendance: 72,
    consecutiveAbsences: 5,
    backlogs: 2,
    riskLevel: "Medium",
    phone: "+91 32109 87654",
    address: "22, Salt Lake, Kolkata",
    risk: { cgpa: 55, backlog: 60, attendance: 65, assignment: 50, overall: 58 },
    attendanceTrend: [80, 77, 73, 70, 72, 72],
    gpaHistory: [7.5, 7.4, 7.2, 6.9],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-01-20", to: "2024-01-24", days: 5, status: "Approved" },
      { type: "Personal Leave", from: "2024-03-05", to: "2024-03-06", days: 2, status: "Pending" },
    ],
    examScores: [{ subject: "Circuits", marks: 65 }, { subject: "Signals", marks: 68 }, { subject: "EMF", marks: 62 }, { subject: "Digital", marks: 70 }, { subject: "VLSI", marks: 66 }],
    assignments: { submitted: 13, total: 20, percentage: 65 },
    awards: [],
    activities: ["Robotics Club"],
  },
  {
    id: 8,
    rollNo: "CS2020003",
    name: "Ananya Krishnan",
    email: "ananya.krishnan@university.edu",
    department: "Computer Science",
    year: 4,
    academicYear: "2020–21",
    mentor: "Dr. Vijay Nair",
    cgpa: 9.4,
    prevGpa: 9.1,
    attendance: 97,
    consecutiveAbsences: 0,
    backlogs: 0,
    riskLevel: "Low",
    phone: "+91 21098 76543",
    address: "5, T Nagar, Chennai",
    risk: { cgpa: 3, backlog: 1, attendance: 3, assignment: 2, overall: 2 },
    attendanceTrend: [96, 97, 98, 96, 97, 97],
    gpaHistory: [8.8, 9.0, 9.1, 9.4],
    leaveHistory: [
      { type: "On Duty", from: "2024-02-12", to: "2024-02-13", days: 2, status: "Approved" },
    ],
    examScores: [{ subject: "DS", marks: 96 }, { subject: "DBMS", marks: 94 }, { subject: "OS", marks: 95 }, { subject: "CN", marks: 97 }, { subject: "SE", marks: 93 }],
    assignments: { submitted: 20, total: 20, percentage: 100 },
    awards: ["Chancellor's Award 2024", "Best Student 2023", "Research Excellence Award"],
    activities: ["Student Council President", "Badminton Team Captain"],
  },
  {
    id: 9,
    rollNo: "ME2022001",
    name: "Rahul Verma",
    email: "rahul.verma@university.edu",
    department: "Mechanical",
    year: 2,
    academicYear: "2022–23",
    mentor: "Prof. Anil Verma",
    cgpa: 6.5,
    prevGpa: 6.7,
    attendance: 68,
    consecutiveAbsences: 6,
    backlogs: 2,
    riskLevel: "Medium",
    phone: "+91 10987 65432",
    address: "67, Bhopal City, Bhopal",
    risk: { cgpa: 62, backlog: 58, attendance: 70, assignment: 55, overall: 62 },
    attendanceTrend: [78, 72, 68, 65, 68, 68],
    gpaHistory: [7.0, 6.9, 6.7, 6.5],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-01-05", to: "2024-01-08", days: 4, status: "Approved" },
      { type: "Personal Leave", from: "2024-03-01", to: "2024-03-03", days: 3, status: "Approved" },
    ],
    examScores: [{ subject: "Thermo", marks: 60 }, { subject: "Fluid", marks: 63 }, { subject: "Manufacturing", marks: 58 }, { subject: "Design", marks: 65 }, { subject: "CAD", marks: 62 }],
    assignments: { submitted: 12, total: 20, percentage: 60 },
    awards: [],
    activities: ["Football Team"],
  },
  {
    id: 10,
    rollNo: "IT2022001",
    name: "Divya Menon",
    email: "divya.menon@university.edu",
    department: "Information Technology",
    year: 2,
    academicYear: "2022–23",
    mentor: "Dr. Lakshmi Iyer",
    cgpa: 8.0,
    prevGpa: 7.8,
    attendance: 83,
    consecutiveAbsences: 2,
    backlogs: 0,
    riskLevel: "Low",
    phone: "+91 98760 12345",
    address: "9, Ernakulam, Kochi",
    risk: { cgpa: 20, backlog: 8, attendance: 25, assignment: 18, overall: 18 },
    attendanceTrend: [85, 84, 82, 83, 83, 83],
    gpaHistory: [7.4, 7.6, 7.8, 8.0],
    leaveHistory: [
      { type: "Personal Leave", from: "2024-02-28", to: "2024-02-29", days: 2, status: "Approved" },
    ],
    examScores: [{ subject: "Web Tech", marks: 80 }, { subject: "Cloud", marks: 82 }, { subject: "Security", marks: 78 }, { subject: "AI", marks: 83 }, { subject: "ML", marks: 79 }],
    assignments: { submitted: 16, total: 20, percentage: 80 },
    awards: ["Cultural Fest Winner 2023"],
    activities: ["Cultural Committee", "Yoga Club"],
  },
  {
    id: 11,
    rollNo: "CE2021001",
    name: "Karan Joshi",
    email: "karan.joshi@university.edu",
    department: "Civil",
    year: 3,
    academicYear: "2021–22",
    mentor: "Dr. Priya Menon",
    cgpa: 7.1,
    prevGpa: 7.0,
    attendance: 80,
    consecutiveAbsences: 3,
    backlogs: 1,
    riskLevel: "Medium",
    phone: "+91 87651 23456",
    address: "23, Vastrapur, Ahmedabad",
    risk: { cgpa: 40, backlog: 42, attendance: 38, assignment: 35, overall: 38 },
    attendanceTrend: [83, 81, 79, 80, 80, 80],
    gpaHistory: [6.8, 6.9, 7.0, 7.1],
    leaveHistory: [
      { type: "On Duty", from: "2024-01-30", to: "2024-01-30", days: 1, status: "Approved" },
      { type: "Sick Leave", from: "2024-03-18", to: "2024-03-19", days: 2, status: "Approved" },
    ],
    examScores: [{ subject: "Structures", marks: 70 }, { subject: "Geotech", marks: 72 }, { subject: "Survey", marks: 68 }, { subject: "Concrete", marks: 75 }, { subject: "Transport", marks: 71 }],
    assignments: { submitted: 14, total: 20, percentage: 70 },
    awards: ["Best Civil Project 2023"],
    activities: ["NSS", "Volleyball Team"],
  },
  {
    id: 12,
    rollNo: "CS2022003",
    name: "Meera Iyer",
    email: "meera.iyer@university.edu",
    department: "Computer Science",
    year: 2,
    academicYear: "2022–23",
    mentor: "Dr. Ramesh Kumar",
    cgpa: 5.5,
    prevGpa: 5.9,
    attendance: 55,
    consecutiveAbsences: 14,
    backlogs: 6,
    riskLevel: "High",
    phone: "+91 76542 34567",
    address: "11, Mylapore, Chennai",
    risk: { cgpa: 90, backlog: 95, attendance: 97, assignment: 88, overall: 93 },
    attendanceTrend: [68, 63, 57, 52, 55, 55],
    gpaHistory: [6.2, 6.0, 5.9, 5.5],
    leaveHistory: [
      { type: "Sick Leave", from: "2024-01-02", to: "2024-01-10", days: 9, status: "Approved" },
      { type: "Personal Leave", from: "2024-02-20", to: "2024-02-26", days: 7, status: "Pending" },
    ],
    examScores: [{ subject: "DS", marks: 40 }, { subject: "DBMS", marks: 38 }, { subject: "OS", marks: 42 }, { subject: "CN", marks: 36 }, { subject: "SE", marks: 44 }],
    assignments: { submitted: 7, total: 20, percentage: 35 },
    awards: [],
    activities: [],
  },
];

// Hierarchy: department -> academicYear -> mentor -> [students]
export function buildHierarchy(dept) {
  const filtered = students.filter(s => s.department === dept);
  const yearMap = {};
  filtered.forEach(s => {
    if (!yearMap[s.academicYear]) yearMap[s.academicYear] = {};
    if (!yearMap[s.academicYear][s.mentor]) yearMap[s.academicYear][s.mentor] = [];
    yearMap[s.academicYear][s.mentor].push(s);
  });
  const sorted = {};
  Object.keys(yearMap).sort().forEach(y => { sorted[y] = yearMap[y]; });
  return sorted;
}

// All departments with metadata
export const DEPARTMENTS = [
  { name: 'Computer Science',       icon: '💻', color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   desc: 'B.Tech Computer Science & Engineering' },
  { name: 'Electronics',            icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   desc: 'B.Tech Electronics & Communication Engineering' },
  { name: 'Mechanical',             icon: '⚙️', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  desc: 'B.Tech Mechanical Engineering' },
  { name: 'Civil',                  icon: '🏗️', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   desc: 'B.Tech Civil Engineering' },
  { name: 'Information Technology', icon: '🖥️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', desc: 'B.Tech Information Technology' },
];

// Generate last 10 batch years  e.g. "2015-19", "2016-20" ... "2024-28"
export function generateBatchYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 9; i >= 0; i--) {
    const start = currentYear - i;
    const end   = start + 4;
    years.push(`${start}–${end}`);
  }
  return years; // oldest → newest
}

// Get mentors for a specific dept + batch year
export function getMentorsForDeptYear(dept, batchYear) {
  // Match by academicYear prefix (e.g. batchYear "2021–25" maps to academicYear "2021–22")
  const startYear = batchYear.split('–')[0];
  const filtered = students.filter(s =>
    s.department === dept && s.academicYear.startsWith(startYear)
  );
  // unique mentors
  const seen = new Set();
  return filtered.reduce((acc, s) => {
    if (!seen.has(s.mentor)) { seen.add(s.mentor); acc.push(s.mentor); }
    return acc;
  }, []);
}

// Get students for a specific dept + batch year + mentor
export function getStudentsForMentor(dept, batchYear, mentor) {
  const startYear = batchYear.split('–')[0];
  return students.filter(s =>
    s.department === dept &&
    s.academicYear.startsWith(startYear) &&
    s.mentor === mentor
  );
}

export const departmentStats = [
  { name: "Computer Science", students: 4, avgCgpa: 7.95, avgAttendance: 76.5 },
  { name: "Electronics", students: 2, avgCgpa: 7.2, avgAttendance: 75 },
  { name: "Mechanical", students: 3, avgCgpa: 7.7, avgAttendance: 81 },
  { name: "Civil", students: 2, avgCgpa: 6.45, avgAttendance: 69 },
  { name: "Information Technology", students: 2, avgCgpa: 8.1, avgAttendance: 84.5 },
];

export const attendanceTrendData = [
  { month: "Aug", attendance: 88 },
  { month: "Sep", attendance: 85 },
  { month: "Oct", attendance: 82 },
  { month: "Nov", attendance: 79 },
  { month: "Dec", attendance: 76 },
  { month: "Jan", attendance: 80 },
  { month: "Feb", attendance: 78 },
  { month: "Mar", attendance: 81 },
];

export const gpaDistribution = [
  { range: "< 5.0", count: 0 },
  { range: "5.0 - 5.9", count: 2 },
  { range: "6.0 - 6.9", count: 3 },
  { range: "7.0 - 7.9", count: 3 },
  { range: "8.0 - 8.9", count: 2 },
  { range: "9.0+", count: 2 },
];

export const examinations = [
  { id: 1, name: "Mid Semester Exam I", date: "2024-02-15", departments: "All", status: "Completed", totalStudents: 120, passed: 108, failed: 12 },
  { id: 2, name: "Mid Semester Exam II", date: "2024-03-20", departments: "All", status: "Completed", totalStudents: 120, passed: 104, failed: 16 },
  { id: 3, name: "End Semester Exam", date: "2024-05-10", departments: "All", status: "Upcoming", totalStudents: 120, passed: null, failed: null },
  { id: 4, name: "Supplementary Exam", date: "2024-06-20", departments: "All", status: "Scheduled", totalStudents: 18, passed: null, failed: null },
  { id: 5, name: "Practical Exam - CS", date: "2024-04-25", departments: "Computer Science", status: "Ongoing", totalStudents: 32, passed: null, failed: null },
];

export const awards = [
  { id: 1, studentId: 8, student: "Ananya Krishnan", rollNo: "CS2020003", award: "Chancellor's Gold Medal", category: "Academic", year: 2024, department: "Computer Science" },
  { id: 2, studentId: 4, student: "Sneha Reddy", rollNo: "ME2020001", award: "University Topper", category: "Academic", year: 2024, department: "Mechanical" },
  { id: 3, studentId: 1, student: "Aarav Sharma", rollNo: "CS2021001", award: "Hackathon Champion", category: "Technical", year: 2024, department: "Computer Science" },
  { id: 4, studentId: 6, student: "Kavya Nair", rollNo: "IT2021003", award: "Best Research Paper", category: "Research", year: 2024, department: "Information Technology" },
  { id: 5, studentId: 8, student: "Ananya Krishnan", rollNo: "CS2020003", award: "Best Student 2023", category: "Overall", year: 2023, department: "Computer Science" },
  { id: 6, studentId: 4, student: "Sneha Reddy", rollNo: "ME2020001", award: "Best Project Award", category: "Technical", year: 2023, department: "Mechanical" },
];

export const notifications = [
  { id: 1, type: "alert", title: "High Risk Alert: Meera Iyer", message: "Student CS2022003 attendance dropped to 55% with 14 consecutive absences.", time: "2 minutes ago", read: false },
  { id: 2, type: "warning", title: "Leave Request Pending", message: "3 leave requests are pending approval for more than 5 days.", time: "1 hour ago", read: false },
  { id: 3, type: "info", title: "Exam Schedule Published", message: "End Semester Exam schedule has been published for May 2024.", time: "3 hours ago", read: false },
  { id: 4, type: "alert", title: "Risk Alert: Arjun Singh", message: "Student CE2022002 has 5 backlogs with overall risk at 90%.", time: "1 day ago", read: true },
  { id: 5, type: "success", title: "Hackathon Registration Open", message: "Hackathon 2024 registrations are now open. Deadline: April 30th.", time: "1 day ago", read: true },
  { id: 6, type: "info", title: "Attendance Report Ready", message: "Monthly attendance report for March 2024 is ready to download.", time: "2 days ago", read: true },
  { id: 7, type: "warning", title: "Low Attendance Warning", message: "12 students have attendance below 75% threshold.", time: "2 days ago", read: true },
];
