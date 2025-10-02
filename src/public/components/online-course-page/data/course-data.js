const courseData = {
  title: 'Aviation Safety Management Systems (SMS) Course',
  subtitle: 'Professional SMS Training for Aviation Personnel',
  description: [
    'Welcome to the Aviation Safety Management Systems (SMS) Course! This comprehensive course is designed to provide aviation professionals with the knowledge and skills necessary to implement and maintain effective SMS within their organizations.',
    "Throughout this course, you'll learn about the four pillars of SMS, hazard identification, risk management, safety assurance, and safety promotion. You'll also explore real-world case studies and best practices for creating a positive safety culture. By the end of this course, you'll be equipped to contribute to a safer and more efficient aviation industry.",
  ],
  goals: [
    'Understand the principles of Aviation Safety Management Systems (SMS)',
    'Implement effective hazard identification and risk management processes',
    'Develop safety policies and objectives aligned with regulatory requirements',
    'Monitor safety performance and conduct internal safety audits',
    'Contribute to a positive safety culture within the organization',
  ],
  modules: [
    {
      id: 'module1',
      title: 'Module 1: Introduction to SMS',
      duration: '1 hour',
      lessons: [
        'What is Safety Management Systems (SMS)?',
        'The Four Pillars of SMS',
        'Benefits of Implementing SMS',
      ],
    },
    {
      id: 'module2',
      title: 'Module 2: Safety Policy and Objectives',
      duration: '2 hours',
      lessons: [
        'Management Commitment and Responsibility',
        'Safety Accountabilities',
        'Setting Safety Objectives',
      ],
    },
    {
      id: 'module3',
      title: 'Module 3: Safety Risk Management',
      duration: '3 hours',
      lessons: [
        'Hazard Identification',
        'Risk Assessment',
        'Risk Mitigation Strategies',
      ],
    },
    {
      id: 'module4',
      title: 'Module 4: Safety Assurance',
      duration: '4 hours',
      lessons: [
        'Safety Performance Monitoring',
        'Internal Safety Audits',
        'Management Review',
      ],
    },
  ],
  materials: [
    { name: 'SMS Manual.pdf', type: 'PDF', size: '3.2 MB' },
    { name: 'ICAO Doc 9859.pdf', type: 'PDF', size: '6.8 MB' },
    { name: 'Hazard Reporting Form.docx', type: 'DOCX', size: '0.5 MB' },
    { name: 'Risk Assessment Matrix.xlsx', type: 'XLSX', size: '0.2 MB' },
    { name: 'Audit Checklist.docx', type: 'DOCX', size: '0.7 MB' },
  ],
  stats: {
    duration: '14 hours',
    students: '1,247 students',
  },
  progress: {
    completion: 18,
    lessonsCompleted: 3,
    lessonsRemaining: 13,
    currentLesson: 'Introduction to Hazard Identification',
    currentLessonNumber: 3,
    totalLessons: 16,
  },
};

export default courseData;
