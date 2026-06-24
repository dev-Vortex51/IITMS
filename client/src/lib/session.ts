let forceLogoutPending = false;

export function markForceLogoutPending() {
  forceLogoutPending = true;
}

export function clearForceLogoutPending() {
  forceLogoutPending = false;
}

export function isForceLogoutPending() {
  return forceLogoutPending;
}
