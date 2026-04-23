export const PLAN_STORAGE_KEY = "qa_trip_plans";
export const FAVORITES_STORAGE_KEY = "qa_favorites";
export const ADDED_STORAGE_KEY = "qa_added";
export const CHECKINS_STORAGE_KEY = "qa_member_checkins";

export function createInitialCheckinForm() {
  return {
    mode: "trip",
    privacy: "friends",
    country: "",
    city: "",
    sourceType: "manual",
    sourceId: "",
    label: "",
    address: "",
    note: "",
  };
}
