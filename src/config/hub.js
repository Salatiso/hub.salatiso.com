// Basic configuration and token helpers for The Hub API
const DEFAULT_BASE_URL = 'https://api.hub.salatiso.com'; // Placeholder; override via localStorage key 'hub.baseUrl'

export function getHubBaseUrl() {
  return localStorage.getItem('hub.baseUrl') || DEFAULT_BASE_URL;
}

export function getHubToken() {
  return localStorage.getItem('hub.accessToken') || '';
}

export function setHubToken(token) {
  if (!token) return;
  localStorage.setItem('hub.accessToken', token);
}

export function setHubBaseUrl(url) {
  if (!url) return;
  localStorage.setItem('hub.baseUrl', url);
}

export function hasHubAuth() {
  return !!getHubToken();
}
