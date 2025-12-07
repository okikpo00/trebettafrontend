// src/utils/auth.js
// small helpers to manage client auth state
export function saveAccessToken(token) {
  if (!token) return;
  localStorage.setItem("trebetta_token", token);
  localStorage.setItem("trebetta_logged_in_at", Date.now());
}

export function clearAuth() {
  localStorage.removeItem("trebetta_token");
  localStorage.removeItem("trebetta_logged_in_at");
  localStorage.removeItem("trebetta_user");
}

export function saveUserProfile(user) {
  if (!user) return;
  localStorage.setItem("trebetta_user", JSON.stringify(user));
}

export function getUserProfile() {
  try {
    const s = localStorage.getItem("trebetta_user");
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
