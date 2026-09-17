'use strict';
// User-selected standing permission for Google's Storage Access API only.
function allowGoogleStorage(permission, origin) {
  if (!['storage-access', 'top-level-storage-access'].includes(permission)) return false;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && (url.hostname === 'google.com' || url.hostname.endsWith('.google.com'));
  } catch { return false; }
}
module.exports = { allowGoogleStorage };
