import { apiGet, apiPost } from "./api";

const assessmentService = {
  start(subject, language, count = 10, childId, level = 1) {
    return apiPost("/assessments/start/", {
      subject,
      language,
      count,
      child_id: childId,
      level,
    });
  },

  submit(assessmentId, answers) {
    return apiPost(`/assessments/${assessmentId}/submit/`, { answers });
  },

  getResult(assessmentId) {
    return apiGet(`/assessments/${assessmentId}/result/`);
  },

  getHistory(childId) {
    return apiGet(
      childId
        ? `/assessments/history/?child_id=${childId}`
        : "/assessments/history/"
    );
  },

  getMyChildren() {
    return apiGet("/assessments/children/");
  },
};

export default assessmentService;