/**
 * Enrich tour itineraries with locations, travelTime, and optionalActivities.
 * Run: node scripts/enrich-itineraries.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'assets', 'json', 'tours');

const travelDefaults = {
  day: 'Private road transfer · flexible pacing',
  multi: {
    1: 'Airport transfer · 45–90 min',
    2: 'Scenic inland transfer · 3–5 hrs',
    3: 'Regional exploration · short hops',
    4: 'Mountain / tea-country transfer · 2–4 hrs',
    5: 'Scenic rail or road · 2–4 hrs',
    6: 'Coastal transfer · 3–5 hrs',
    7: 'Leisure day · optional short transfers',
    8: 'Regional transfer · 2–4 hrs',
    9: 'Wildlife park access · morning / afternoon',
    10: 'Leisure pacing · flexible transfers',
    11: 'Return toward coast · 3–5 hrs',
    12: 'Coastal leisure · short hops',
    13: 'Southern coast exploration',
    14: 'Departure transfer · timed to flight',
  },
};

function enrichDay(day, category) {
  const locations =
    Array.isArray(day.locations) && day.locations.length
      ? day.locations
      : day.location?.name
        ? [day.location.name, day.location.region].filter(Boolean)
        : ['Sri Lanka'];

  const travelTime =
    day.travelTime ||
    (category === 'day'
      ? travelDefaults.day
      : travelDefaults.multi[day.day] || 'Private transfer · flexible pacing');

  const optionalActivities =
    day.optionalActivities ||
    (day.highlights?.length
      ? [`Optional: deepen the day with ${day.highlights[0].toLowerCase()}`]
      : ['Optional village stop', 'Optional photo pacing']);

  // Keep thumbnail-sized metadata; UI displays small
  const images = (day.images || []).map((img) => ({
    ...img,
    width: img.width && img.width > 640 ? 640 : img.width || 640,
    height: img.height && img.height > 480 ? 480 : img.height || 480,
  }));

  return {
    ...day,
    locations,
    travelTime,
    optionalActivities,
    images,
  };
}

function processFile(file) {
  const full = path.join(root, file);
  const tours = JSON.parse(fs.readFileSync(full, 'utf8'));
  const category = file.includes('day-tours') && !file.includes('multi') ? 'day' : 'multi-day';
  const next = tours.map((tour) => ({
    ...tour,
    itinerary: (tour.itinerary || []).map((d) => enrichDay(d, category === 'day' ? 'day' : 'multi')),
  }));
  fs.writeFileSync(full, JSON.stringify(next, null, 2) + '\n');
  console.log('Updated', file, next.length, 'tours');
}

['day-tours.json', 'multi-day-tours.json'].forEach(processFile);
