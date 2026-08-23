const KINGSTON_BBOX = '17.9340,-76.8790,18.0720,-76.7040';

export function buildKingstonVenueQuery(bbox = KINGSTON_BBOX) {
  return `[out:json][timeout:90];
(
  nwr["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub|nightclub|arts_centre|theatre"](${bbox});
  nwr["tourism"~"attraction|museum|gallery|hotel|guest_house|hostel"](${bbox});
  nwr["leisure"~"fitness_centre|sports_centre"](${bbox});
  nwr["shop"~"mall|department_store|clothes|gift"](${bbox});
);
out center tags;`;
}

export function buildParishVenueQuery(isoCode) {
  if (!/^JM-\d{2}$/.test(isoCode)) throw new TypeError('A Jamaica ISO 3166-2 parish code is required.');
  return `[out:json][timeout:180];
area["ISO3166-2"="${isoCode}"]["boundary"="administrative"]->.searchArea;
(
  nwr["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub|nightclub|arts_centre|theatre|cinema|marketplace"](area.searchArea);
  nwr["tourism"~"attraction|museum|gallery|hotel|guest_house|hostel|resort|viewpoint"](area.searchArea);
  nwr["leisure"~"fitness_centre|sports_centre|water_park|marina"](area.searchArea);
  nwr["shop"~"mall|department_store|clothes|gift|craft|jewelry|beauty|books"](area.searchArea);
);
out center tags;`;
}

export function buildCityVenueQuery(bbox) {
  if (!/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(bbox || '')) {
    throw new TypeError('A city bounding box is required as south,west,north,east.');
  }
  return `[out:json][timeout:180];
(
  nwr["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub|nightclub|arts_centre|theatre|cinema|marketplace"](${bbox});
  nwr["tourism"~"attraction|museum|gallery|hotel|guest_house|hostel|resort|viewpoint"](${bbox});
  nwr["leisure"~"fitness_centre|sports_centre|water_park|marina"](${bbox});
  nwr["shop"~"mall|department_store|clothes|gift|craft|jewelry|beauty|books"](${bbox});
);
out center tags;`;
}

export async function fetchOverpass(query, options = {}) {
  const endpoint = options.endpoint || 'https://overpass-api.de/api/interpreter';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'user-agent': options.userAgent || 'PromorangInventoryPilot/1.0 (inventory@promorang.com)',
    },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(options.timeoutMs || 120_000),
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed (${response.status} ${response.statusText}).`);
  }
  return response.json();
}
