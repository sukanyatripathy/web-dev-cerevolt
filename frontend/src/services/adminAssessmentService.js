import { apiGet } from "./api.js";

const adminAssessmentService = {
  getOverview() {
    return apiGet("/assessments/admin/overview/");
  },

  searchChildren(query) {
    return apiGet(
      `/assessments/admin/children/?q=${encodeURIComponent(query || "")}`
    );
  },

  getChild(childId) {
    return apiGet(`/assessments/admin/children/${childId}/`);
  },

  exportCsv() {
    return apiGet("/assessments/admin/export/");
  },
};

export default adminAssessmentService;