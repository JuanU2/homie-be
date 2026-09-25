import {
  PLACE_CATEGORIES,
  TRANSPORT_TYPES,
  type PropertyInsightsInput,
} from './dtos/property-insights.dto';

export function buildPropertyInsightsPrompt(
  input: PropertyInsightsInput,
): string {
  return `You are a local real-estate analyst writing a neighborhood overview for a property listing.

Property:
- Description: ${input.description || '(not provided)'}
- Address: ${input.street} ${input.streetNumber}, ${input.zipCode} ${input.city}, ${input.country}
- Coordinates: ${input.lat}, ${input.lng}

Produce structured data describing what is around this property.

Guidance:
- Language: write the "advantages" in the same language as the property description above. Keep place "name" values as their real local names (do not translate proper nouns).
- List up to 3 of the nearby places that most affect day-to-day living, most important first: public transport stops/stations, supermarkets, schools, hospitals, shopping centers, libraries, parking, and the city center.
- For each place provide its category, a short name, an approximate location (latitude/longitude close to the property), and an approximate distance.
- Distance is a rough estimate: give distanceApproxMeters plus a distanceApproxTime with the most natural transportType for that distance. Prefer WALK for places within walking distance, otherwise CAR, PUBLIC_TRANSPORT or BIKE.
- Only include real, well-known places you are reasonably confident exist near this location. If you are unsure whether a specific place exists nearby, omit it rather than inventing one.
- "advantages": up to 5 short, factual phrases describing the property's strengths based on its description and surroundings (e.g. "Close to public transport", "Quiet residential street").
- Use only the allowed placeCategory and transportType values, and return only the fields defined in the schema.`;
}

export function buildPropertyInsightsJsonSchema() {
  return {
    type: 'object',
    properties: {
      nearbyPlaces: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            placeCategory: { type: 'string', enum: [...PLACE_CATEGORIES] },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
              required: ['lat', 'lng'],
            },
            name: { type: 'string' },
            distance: {
              type: 'object',
              properties: {
                distanceApproxMeters: { type: 'integer' },
                distanceApproxTime: {
                  type: 'object',
                  properties: {
                    transportType: {
                      type: 'string',
                      enum: [...TRANSPORT_TYPES],
                    },
                    timeInMinutes: { type: 'integer' },
                  },
                  required: ['transportType', 'timeInMinutes'],
                },
              },
              required: ['distanceApproxMeters', 'distanceApproxTime'],
            },
          },
          required: ['placeCategory', 'location', 'name', 'distance'],
        },
      },
      advantages: {
        type: 'array',
        maxItems: 5,
        items: { type: 'string' },
      },
    },
    required: ['nearbyPlaces', 'advantages'],
  };
}
