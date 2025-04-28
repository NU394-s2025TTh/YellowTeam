/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from 'firebase-functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

export const generatePackingReport = functions.https.onCall(async (data) => {
  const items: { name: string; category: string; warmth: number }[] = data.items || [];

  const bulletList = items
    .map((i) => `- ${i.name} (${i.category}, warmth ${i.warmth}/5)`)
    .join('\n');

  const msg: { role: 'system' | 'user'; content: string }[] = [
    { role: 'system', content: 'You’re a ski-packing assistant.' },
    {
      role: 'user',
      content: `They already have:\n${bulletList}\n\nWhat else should they pack for a week-long ski trip? Reply as a bullet list.`,
    },
  ];

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: msg,
    temperature: 0.7,
    max_tokens: 300,
  });

  return { report: resp.choices[0].message.content };
});
