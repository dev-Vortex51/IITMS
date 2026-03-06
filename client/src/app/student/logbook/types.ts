export interface LogbookFormState {
  tasksPerformed: string;
  skillsAcquired: string;
  challenges: string;
  lessonsLearned: string;
}

export const emptyLogbookForm: LogbookFormState = {
  tasksPerformed: "",
  skillsAcquired: "",
  challenges: "",
  lessonsLearned: "",
};
