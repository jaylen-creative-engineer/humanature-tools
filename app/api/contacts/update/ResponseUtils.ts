import { NextResponse } from 'next/server';
import { NotionService, TwilioService } from '@/app/services';

const notionService = new NotionService();
const twilioService = new TwilioService();

export function handleParsedResponse(
  parsedResponse: AICRMResponse,
  isTwilioRequest: boolean,
  senderPhoneNumber: string,
  messages: CRMMessage[],
): Promise<NextResponse> {
  const followUpNeeded =
    (parsedResponse.requires_follow_up &&
      messages.some((message) => !message.is_follow_up)) ||
    false;
  addMessageToHistory(
    parsedResponse.response_message || '',
    followUpNeeded,
    messages,
  );

  return followUpNeeded
    ? handleFollowUp(parsedResponse, isTwilioRequest, senderPhoneNumber)
    : handleFinalResponse(parsedResponse, isTwilioRequest, senderPhoneNumber);
}

function addMessageToHistory(
  content: string,
  isFollowUp: boolean,
  messages: CRMMessage[],
): void {
  const message: CRMMessage = {
    name: 'humanature-assistant',
    role: 'assistant',
    content,
    ...(isFollowUp && { is_follow_up: true }),
  };
  messages.push(message);
}

async function handleFollowUp(
  parsedResponse: AICRMResponse,
  isTwilioRequest: boolean,
  senderPhoneNumber: string,
): Promise<NextResponse> {
  if (isTwilioRequest && parsedResponse.response_message) {
    await twilioService.sendMessage(
      parsedResponse.response_message,
      senderPhoneNumber,
    );
  }

  return NextResponse.json(
    { response: parsedResponse.response_message, follow_up: true },
    { status: 200 },
  );
}

async function handleFinalResponse(
  parsedResponse: AICRMResponse,
  isTwilioRequest: boolean,
  senderPhoneNumber: string,
): Promise<NextResponse> {
  if (isTwilioRequest && parsedResponse.response_message) {
    await twilioService.sendMessage(
      parsedResponse.response_message,
      senderPhoneNumber,
    );
  }

  const notionResponse = await notionService.updateCRMDatabase(parsedResponse);
  const finalMessage =
    parsedResponse.response_message +
    ` Here's the link to the contact in your CRM: ${notionResponse.url}`;

  return NextResponse.json({ response: finalMessage }, { status: 200 });
}

export function handleRefusal(
  refusalMessage: string,
  messages: CRMMessage[],
): NextResponse {
  const message: CRMMessage = {
    name: 'humanature-user',
    role: 'assistant',
    content: refusalMessage,
  };
  messages.push(message);

  return NextResponse.json({ response: refusalMessage }, { status: 500 });
}

export async function validateWebhookRequest(req: Request): Promise<{
  content: any;
  senderPhoneNumber: string;
  isTwilioRequest: boolean;
}> {
  const isTwilioRequest =
    req.headers
      .get('Content-Type')
      ?.includes('application/x-www-form-urlencoded') || false;

  if (isTwilioRequest) {
    console.log('Received Twilio Request');
    const isValidTwilioRequest = await twilioService.validateRequest(req);

    if (!isValidTwilioRequest) {
      throw new Error('Invalid Twilio request');
    }

    const clonedReq = req.clone();
    const formData = await clonedReq.formData();
    const senderPhoneNumber = formData.get('From') as string;
    const content = {
      contactMessage: formData.get('Body') as string,
    };

    return { content, senderPhoneNumber, isTwilioRequest };
  } else {
    const content = await req.json();
    return { content, senderPhoneNumber: '', isTwilioRequest };
  }
}
