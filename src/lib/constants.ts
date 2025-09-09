// Education and Lab Equipment constants
export const SUBJECTS = ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'literature', 'history', 'geography'] as const;
export const EDUCATION_LEVELS = ['primary', 'secondary', 'university', 'vocational'] as const;
export const EXAM_BOARDS = ['UNEB', 'Cambridge', 'Edexcel'] as const;
export const LAB_EQUIPMENT = ['microscope', 'beaker', 'scale', 'spectrometer', 'pipette', 'burner'] as const;
export const LAB_CATEGORIES = ['biology', 'chemistry', 'physics'] as const;

// Type definitions from constants
export type Subject = (typeof SUBJECTS)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type ExamBoard = (typeof EXAM_BOARDS)[number];
export type LabEquipment = (typeof LAB_EQUIPMENT)[number];
export type LabCategory = (typeof LAB_CATEGORIES)[number];
