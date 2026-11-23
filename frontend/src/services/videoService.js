import { apiGet, apiPatch, apiPost } from "./api";

const videoService = {
  list(filters = {}) {
    const params = new URLSearchParams();
    ["topic", "age_group", "language"].forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const query = params.toString();
    return apiGet(query ? `/videos/?${query}` : "/videos/");
  },

  startWatch(videoId) {
    return apiPost(`/videos/${videoId}/watch/`, {});
  },

  updateWatch(watchId, secondsWatched, completed = false) {
    return apiPatch(`/videos/watch/${watchId}/`, {
      seconds_watched: secondsWatched,
      completed,
    });
  },
};

export default videoService;