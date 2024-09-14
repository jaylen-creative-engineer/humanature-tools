import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  ContactInfoSchema,
  contactsSystemPrompt,
  ContactsOutputResponseSchema,
} from './ContactsSchema';
import { NotionService, TwilioService } from '@/app/services';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});
const notionService = new NotionService();
const twilioService = new TwilioService();

const messages: CRMMessage[] = [
  {
    name: 'contact-manager',
    role: 'system',
    content: contactsSystemPrompt,
  },
];

export async function POST(req: Request) {
  try {
    const isTwilioRequest = req.headers
      .get('Content-Type')
      ?.includes('application/x-www-form-urlencoded');

    let content;
    let senderPhoneNumber = '';

    if (isTwilioRequest) {
      const isValidTwilioRequest = await twilioService.validateRequest(req);

      if (!isValidTwilioRequest) {
        return NextResponse.json(
          { error: 'Invalid Twilio request' },
          { status: 400 },
        );
      }

      const clonedReq = req.clone();
      const formData = await clonedReq.formData();
      senderPhoneNumber = formData.get('From') as string;
      content = {
        contactMessage: formData.get('Body') as string,
      };
    } else {
      content = await req.json();
    }

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
          const parsedResponse = ai_message.parsed;
          const followUpNeeded =
            parsedResponse.additional_details_needed &&
            !messages.some((message) => message.is_follow_up);

          messages.push({
            name: 'humanature-assistant',
            role: 'assistant',
            content: parsedResponse.response_message,
            ...(followUpNeeded && { is_follow_up: true }),
          });

          if (followUpNeeded) {
            isTwilioRequest &&
              (await twilioService.sendMessage(
                parsedResponse.response_message,
                senderPhoneNumber,
              ));

            return NextResponse.json(
              { response: parsedResponse.response_message, follow_up: true },
              { status: 200 },
            );
          }

          isTwilioRequest &&
            (await twilioService.sendMessage(
              parsedResponse.response_message,
              senderPhoneNumber,
            ));

          await notionService.updateCRMDatabase(parsedResponse);
          return NextResponse.json(
            {
              response: `${parsedResponse.response_message}`,
            },
            { status: 200 },
          );
        }

        if (ai_message.refusal) {
          messages.push({
            name: 'humanature-user',
            role: 'assistant',
            content: ai_message.refusal,
          });

          return NextResponse.json(
            { response: ai_message.refusal },
            { status: 500 },
          );
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    return NextResponse.json(
      { response: 'Internal Server Error', error },
      { status: 500 },
    );
  }
}
