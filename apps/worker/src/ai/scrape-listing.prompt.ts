import { ROOM_TYPES } from './dtos/ai.dto';

export interface ScrapeListingPromptOptions {
  equipmentTypeNames: string[];
}

export interface ScrapeListingJsonSchemaOptions {
  equipmentTypeNames: string[];
}

export function buildScrapeListingPrompt({
  equipmentTypeNames,
}: ScrapeListingPromptOptions): string {
  const equipmentRule =
    equipmentTypeNames.length > 0
      ? `Use ONLY these equipmentType values:\n    ${equipmentTypeNames.join(', ')}\n  Map each item to the closest matching equipmentType. If an item has no matching equipmentType, omit it.`
      : `Use a concise, lower-case equipmentType name for each item.`;

  return `You are an expert real-estate listing scraper. You are given the HTML of a single property listing as an attached file. Extract all the useful listing details from it and produce structured data, polishing the description where helpful.

Rules:
- Only report information that is clearly present in the listing. Never invent or guess any detail that is not stated.
- Every field is optional. If a value is not clearly present, omit the field entirely — do not return null, empty strings, or zero placeholders.
- The listing content may be written in any language, not only English. Read and interpret the content in its original language — do not assume it is English.
- Write all text fields in the same language as the listing.

Field guidance:
- "title": the listing title as shown on the page.
- "description": a clean, complete listing description. You may rewrite and polish the wording, but only include details that appear in the page — do not add features or amenities that are not stated.
- "priceAmount" and "priceCurrency": the listing price. Return the numeric amount and the ISO 4217 currency code (e.g. EUR, USD, CZK). Only include both if a price is clearly shown.
- "idealMoveInDate": the move-in / availability date in YYYY-MM-DD format, only if clearly stated.
- "maxRoommates" and "currentRoommates": only if the listing states them.
- "rooms": distinct room types with their counts. Use ONLY these roomType values:
    DORMITORY = a bedroom / sleeping room
    BATHROOM = a room with a bathtub or shower
    KITCHEN = a kitchen
    LIVING_ROOM = a living room / lounge
    TOILET = a room with only a toilet (no shower/bath)
    WARDROBE = a walk-in closet / dressing room
    BALCONY = a balcony or terrace
    OTHER = any other room type
  Merge duplicate room types into one entry with the summed count.
- "equipment": ${equipmentRule}
  Merge duplicates and aggregate counts.
- "images": image URLs found on the page. Return full absolute URLs (resolve relative URLs against the listing page URL). Set "title": true for at most ONE image — the main/cover photo; set "title": false for all others.
- "property": address and physical details of the property (description, sizeM2, roomCount, country, city, zipCode, street, streetNumber, lat, lng). Fill in only what is stated.
- Coordinates: include "lat" and "lng" ONLY if exact coordinates are explicitly present in the page. If the page only provides an address or a map without raw coordinates, omit both lat and lng — the user will fill them in later.

Be conservative: when unsure, omit a field rather than guessing. Do not add any fields beyond those defined in the schema.`;
}

export function buildScrapeListingJsonSchema({
  equipmentTypeNames,
}: ScrapeListingJsonSchemaOptions) {
  const equipmentTypeSchema =
    equipmentTypeNames.length > 0
      ? { type: 'string', enum: equipmentTypeNames }
      : { type: 'string' };

  return {
    type: 'object',
    description: 'Structured data extracted from a property listing page.',
    properties: {
      title: {
        type: 'string',
        description: 'The listing title as shown on the page.',
      },
      description: {
        type: 'string',
        description:
          'A clean, complete listing description written in the same language as the listing.',
      },
      priceAmount: {
        type: 'number',
        description: 'The listing price as a numeric amount (no currency symbol).',
      },
      priceCurrency: {
        type: 'string',
        description: 'The ISO 4217 currency code of the price (e.g. EUR, USD, CZK).',
      },
      idealMoveInDate: {
        type: 'string',
        description: 'The move-in / availability date in YYYY-MM-DD format.',
      },
      maxRoommates: {
        type: 'integer',
        description: 'The maximum number of roommates.',
      },
      currentRoommates: {
        type: 'integer',
        description: 'The current number of roommates.',
      },
      property: {
        type: 'object',
        description: 'Physical details and address of the property.',
        properties: {
          description: {
            type: 'string',
            description: 'A concise description of the property itself.',
          },
          sizeM2: {
            type: 'integer',
            description: 'Total floor area in square meters.',
          },
          roomCount: {
            type: 'integer',
            description: 'Total number of rooms.',
          },
          rooms: {
            type: 'array',
            description: 'Distinct room types with their counts.',
            items: {
              type: 'object',
              properties: {
                roomType: { type: 'string', enum: [...ROOM_TYPES] },
                count: {
                  type: 'integer',
                  description: 'The number of rooms of this type.',
                },
              },
              required: ['roomType', 'count'],
            },
          },
          equipment: {
            type: 'array',
            description: 'Appliances and furniture with their counts.',
            items: {
              type: 'object',
              properties: {
                equipmentType: equipmentTypeSchema,
                count: {
                  type: 'integer',
                  description: 'The number of items of this type.',
                },
              },
              required: ['equipmentType', 'count'],
            },
          },
          images: {
            type: 'array',
            description: 'Image URLs from the listing.',
            items: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string' },
                title: {
                  type: 'boolean',
                  description:
                    'True for the single main/cover image, false for all others.',
                },
              },
              required: ['imageUrl', 'title'],
            },
          },
        },
        required: ['description', 'rooms', 'equipment', 'sizeM2', 'images'],
      },
    },
    required: ['title', 'description', 'property'],
  };
}
