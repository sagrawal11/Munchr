// Build a maps deep-link to a machine. Google Maps universal URL opens the native
// Maps app on mobile (Apple Maps on iOS if set as default) and the web on desktop.
export function directionsUrl(machine) {
  const [lat, lng] = (machine && machine.location) || [];
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
