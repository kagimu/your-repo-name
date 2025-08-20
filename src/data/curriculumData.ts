export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  curriculum: 'ugandan' | 'cambridge' | 'international';
  prerequisites: string[];
  learningOutcomes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LearningPath {
  id: string;
  studentId: string;
  curriculum: 'ugandan' | 'cambridge' | 'international';
  level: string;
  subject: string;
  currentTopic: string;
  completedTopics: string[];
  progress: number;
  nextMilestones: string[];
  recommendations: string[];
}

export const UgandanCurriculum = {
  primary: {
    subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
    levels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
    examBoard: 'UNEB'
  },
  oLevel: {
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'English Language', 'Literature', 'Geography', 'History'
    ],
    levels: ['S1', 'S2', 'S3', 'S4'],
    examBoard: 'UNEB'
  },
  aLevel: {
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Literature in English', 'Economics', 'History'
    ],
    levels: ['S5', 'S6'],
    examBoard: 'UNEB'
  }
};

export const CambridgeCurriculum = {
  primary: {
    subjects: ['Mathematics', 'Science', 'English', 'Global Perspectives'],
    levels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    examBoard: 'Cambridge International'
  },
  igcse: {
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'English Language', 'English Literature', 'Geography'
    ],
    levels: ['Year 10', 'Year 11'],
    examBoard: 'Cambridge International'
  },
  aLevel: {
    subjects: [
      'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry',
      'Biology', 'Economics', 'Computer Science'
    ],
    levels: ['AS Level', 'A2 Level'],
    examBoard: 'Cambridge International'
  }
};

export interface SubjectContent {
  topics: string[];
  subtopics: Record<string, string[]>;
  practiceAreas: string[];
  resources: string[];
}

export interface CurriculumContent {
  [subject: string]: {
    [level: string]: SubjectContent;
  };
}

export const generateTopicContent = (
  subject: string,
  level: string,
  curriculum: 'ugandan' | 'cambridge' | 'international'
): SubjectContent => {
  // This would typically come from a database
  // For now, we'll generate some sample content
  return {
    topics: [
      'Introduction to ' + subject,
      'Basic Concepts',
      'Advanced Topics',
      'Practical Applications'
    ],
    subtopics: {
      [`Introduction to ${subject}`]: [
        'Overview',
        'Historical Context',
        'Modern Applications'
      ],
      'Basic Concepts': [
        'Fundamental Principles',
        'Key Theories',
        'Basic Problems'
      ],
      'Advanced Topics': [
        'Complex Problems',
        'Real-world Applications',
        'Case Studies'
      ],
      'Practical Applications': [
        'Lab Work',
        'Field Studies',
        'Project Work'
      ]
    },
    practiceAreas: [
      'Theory Questions',
      'Practical Exercises',
      'Past Papers',
      'Project Work'
    ],
    resources: [
      'Textbooks',
      'Online Resources',
      'Video Tutorials',
      'Practice Tests'
    ]
  };
};
