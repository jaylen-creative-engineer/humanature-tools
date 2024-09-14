import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  ContactInfoSchema,
  contactsSystemPrompt,
  ContactsOutputResponseSchema,
} from './ContactsSchema';
import {
  handleParsedResponse,
  handleRefusal,
  validateWebhookRequest,
} from './ResponseUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

const messages: CRMMessage[] = [
  {
    name: 'contact-manager',
    role: 'system',
    content: contactsSystemPrompt,
  },
];

export async function POST(req: Request) {
  try {
    const { content, senderPhoneNumber, isTwilioRequest } =
      await validateWebhookRequest(req);
    const safeResponse = ContactInfoSchema.parse(content);

    messages.push({
      name: 'humanature-user',
      role: 'user',
      content: safeResponse.contactMessage,
    });

    return openai.beta.chat.completions
      .parse({
        model: 'gpt-4o-2024-08-06',
        messages: messages,
        response_format: zodResponseFormat(
          ContactsOutputResponseSchema,
          'contact',
        ),
      })
      .then((response) => response.choices[0].message)
      .then(async (ai_message) => {
        if (ai_message.parsed) {
          console.log('AI Message Parsed');
          return handleParsedResponse(
            ai_message.parsed as AICRMResponse,
            isTwilioRequest,
            senderPhoneNumber,
            messages,
          );
        }

        if (ai_message.refusal) {
          return handleRefusal(ai_message.refusal, messages);
        }

        throw new Error('Error getting response from AI');
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid Twilio request') {
      return NextResponse.json(
        { error: 'Invalid Twilio request' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { response: 'Internal Server Error', error },
      { status: 500 },
    );
  }
}
