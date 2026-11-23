import { apiGet, apiPost } from "./api.js";


export function saveGameSession(payload) {
  return apiPost("/gameplay/sessions/", payload);
}


export function getMyChildCode() {
  return apiGet("/gameplay/my-code/");
}


export function linkChild(childCode) {
  return apiPost("/gameplay/link-child/", { child_code: childCode });
}


export function getMyChildren() {
  return apiGet("/gameplay/my-children/");
}


export function getChildAnalysis(childId) {
  return apiGet(`/gameplay/children/${childId}/analysis/`);
}


export async function downloadChildCsv(childId) {
  const csv = await apiGet(`/gameplay/children/${childId}/export/`);
  const text = typeof csv === "string" ? csv : "";
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `child-${childId}-game-results.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}


export function parentSignup(payload) {
  return apiPost("/gameplay/parent-signup/", payload, { auth: false });
}