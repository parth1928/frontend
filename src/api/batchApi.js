import axios from 'axios';

export const updateSubjectBatches = async (subjectId, batches) => {
  // batches: [{ batchName, students: [studentId, ...] }]
  return axios.put(`/api/Subject/${subjectId}/batches`, { batches });
};
