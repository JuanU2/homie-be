import { ROOM_TYPES, type PropertyLocation } from './dtos/ai.dto';

export interface PropertyAnalysisPromptOptions {
  language?: string;
  equipmentTypeNames: string[];
  location?: PropertyLocation;
}

export interface PropertyAnalysisJsonSchemaOptions {
  equipmentTypeNames: string[];
}

export function buildPropertyAnalysisPrompt({
  language,
  equipmentTypeNames,
  location,
}: PropertyAnalysisPromptOptions): string {
  const languageRule = language
    ? `- Language: write the "description" field in ${language}. Do not translate the "roomType" or "equipmentType" values — keep them exactly as listed below.`
    : null;

  const locationRule = location
    ? `- Location: the user provided this address — use it to contextualize the description. Do not invent a different location.\n    - Country: ${location.country}\n    - City: ${location.city}\n    - ZIP code: ${location.zipCode}\n    - Street: ${location.street} ${location.streetNumber}\n    - Coordinates: ${location.lat}, ${location.lng}`
    : null;

  return `You are an expert real-estate analyst. You are given several photographs of a single residential property (a flat, apartment, or house). Analyze all the photos together and produce structured data describing only what is visible.

Rules:
- All photos belong to ONE property. Combine evidence across photos and do NOT double-count a room or item that appears in more than one photo.
- Only report what is actually visible or strongly implied. Never invent details.${languageRule ? `\n${languageRule}` : ''}${locationRule ? `\n${locationRule}` : ''}

Field guidance:
- "description": A concise, factual summary (2-4 sentences) of the property — layout, style, condition, finishes, natural light, and any notable features. If a location is provided, naturally mention the city and area within the description.
- "sizeM2": Estimate the total floor area in square meters. This is a rough estimate; return null only if you cannot make a reasonable guess.
- "roomCount": Total number of rooms you can infer (the sum of the counts in "rooms").
- "rooms": Distinct room types with their counts. Use ONLY these roomType values:
    DORMITORY = a bedroom / sleeping room
    BATHROOM = a room with a bathtub or shower
    KITCHEN = a kitchen
    LIVING_ROOM = a living room / lounge
    TOILET = a room with only a toilet (no shower/bath)
    WARDROBE = a walk-in closet / dressing room
    BALCONY = a balcony or terrace
    OTHER = any other room type
  Merge duplicate room types into one entry with the summed count.
- "equipment": Visible appliances and significant furniture with counts. Use ONLY these equipmentType values:
    ${equipmentTypeNames.join(', ')}
  Map each visible item to the closest matching equipmentType. If an item has no matching equipmentType, omit it. Merge duplicates and aggregate counts.

Be conservative: when unsure of a count, prefer the lower estimate. Do not add any fields beyond those defined in the schema (description, sizeM2, roomCount, rooms, equipment).`;
}

export function buildPropertyAnalysisJsonSchema({
  equipmentTypeNames,
}: PropertyAnalysisJsonSchemaOptions) {
  const equipmentTypeSchema =
    equipmentTypeNames.length > 0
      ? { type: 'string', enum: equipmentTypeNames }
      : { type: 'string' };

  return {
    type: 'object',
    properties: {
      description: { type: 'string' },
      sizeM2: { type: ['integer', 'null'] },
      roomCount: { type: 'integer' },
      rooms: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            roomType: { type: 'string', enum: [...ROOM_TYPES] },
            count: { type: 'integer' },
          },
          required: ['roomType', 'count'],
        },
      },
      equipment: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            equipmentType: equipmentTypeSchema,
            count: { type: 'integer' },
          },
          required: ['equipmentType', 'count'],
        },
      },
    },
    required: ['description', 'sizeM2', 'roomCount', 'rooms', 'equipment'],
  };
}
