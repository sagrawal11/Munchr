'use client';

// Generate or retrieve an anonymous session ID
function getSessionId() {
  if (typeof window === 'undefined') return null;
  let id = sessionStorage.getItem('munchr_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('munchr_session_id', id);
  }
  return id;
}

function getDeviceType() {
  if (typeof window === 'undefined') return null;
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

export async function trackEvent(eventType, props = {}) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionId,
        device_type: getDeviceType(),
        ...props,
      }),
    });
  } catch {
    // Never throw — tracking must never break the app
  }
}

// Convenience wrappers
export const track = {
  // building = the building of the top/nearest result, giving each search a zone
  // context for building-level demand analysis (null when there's no result).
  search: (query, normalizedQuery, resultCount, campus, building = null) =>
    trackEvent('search_performed', { query, normalized_query: normalizedQuery, result_count: resultCount, campus, building_id: building }),

  noResults: (query, campus) =>
    trackEvent('no_results_returned', { query, campus }),

  // Fired when a user explicitly picks a product from search suggestions — a
  // cleaner product-intent signal than free-text search (which may be a typo).
  productClicked: (productName, campus = null) =>
    trackEvent('product_clicked', { query: productName, campus }),

  // Once per session — records where the visit came from (e.g. "flyer" via QR, else "direct").
  appOpened: (source) =>
    trackEvent('app_opened', { query: source }),

  machineClicked: (machineId, buildingId, campus) =>
    trackEvent('machine_clicked', { machine_id: machineId, building_id: buildingId, campus }),

  directionsClicked: (machineId, buildingId) =>
    trackEvent('directions_clicked', { machine_id: machineId, building_id: buildingId }),

  categoryFilter: (chipId, campus) =>
    trackEvent('category_filter_used', { query: chipId, campus }),

  campusFilter: (campus) =>
    trackEvent('building_filter_used', { campus }),

  locationEnabled: () =>
    trackEvent('location_permission_enabled'),

  locationDenied: () =>
    trackEvent('location_permission_denied'),
};
