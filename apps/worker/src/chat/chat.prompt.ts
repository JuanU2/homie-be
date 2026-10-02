import type { RoommateRequestBlob } from '@homie/events';

export interface ChatPromptOptions {
  roommateRequest: RoommateRequestBlob;
  userMessages: string[];
}

export function buildChatPrompt({
  roommateRequest,
  userMessages,
}: ChatPromptOptions): string {
  const p = roommateRequest;
  const property = p.property;

  const details = [
    `- Title: ${p.title}`,
    `- Description: ${p.description}`,
    `- Price: ${p.priceAmount} ${p.priceCurrency}`,
    `- Status: ${p.status}`,
    `- City: ${property.city}, ${property.country}`,
    `- Address: ${property.street} ${property.streetNumber}, ${property.zipCode}`,
    property.sizeM2 != null ? `- Size: ${property.sizeM2} m²` : null,
    `- Rooms: ${property.roomCount}`,
    `- Max roommates: ${p.maxRoommates}, currently ${p.currentRoommates}`,
  ]
    .filter(Boolean)
    .join('\n');

  const history = userMessages.length
    ? userMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')
    : '(no prior messages)';

  return `You are Homie's assistant, helping a user evaluate and discuss a roommate listing. Answer the user's questions helpfully and concisely, grounded in the listing details below. Do not invent facts about the listing.

Listing details:
${details}

Recent user messages (oldest first):
${history}

Answer the user's latest question in plain text.`;
}
