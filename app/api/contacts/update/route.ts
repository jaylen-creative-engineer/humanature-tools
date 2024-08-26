import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  ContactInfoSchema,
  contactsSystemPrompt,
  ContactsOutputResponseSchema,
} from '../ContactsSchema';
import { NotionService } from '@/app/services';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});
const notionService = new NotionService();

export async function POST(req: Request) {
  try {
    let content = (req && getTwillioBody(req)) || (await req.json());

    if (!content.properties) {
      content = {
        properties: {
          contactInfo: content,
        },
      };
    }

    const safeResponse = ContactInfoSchema.parse(content);
    const userMessage = safeResponse.properties.contactInfo;

    return openai.beta.chat.completions
      .parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: contactsSystemPrompt },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        response_format: zodResponseFormat(
          ContactsOutputResponseSchema,
          'contact',
        ),
      })
      .then((response) => response.choices[0].message)
      .then(async (ai_message) => {
        if (ai_message.parsed) {
          const parsedResponse = ai_message.parsed;
          const url = await notionService.updateDatabase(parsedResponse);

          return NextResponse.json(
            {
              message: `${parsedResponse.response_message}. Here's a link to the page ${url}.`,
            },
            { status: 200 },
          );
        }

        if (ai_message.refusal) {
          return NextResponse.json(
            { message: ai_message.refusal },
            { status: 500 },
          );
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error ${error}` },
      { status: 200 },
    );
  }
}

function getTwillioBody(req: Request) {
  const url = new URL(req.url);
  const twillioBody = url.searchParams.get('body') || JSON.stringify(req.body);

  return twillioBody;
}
