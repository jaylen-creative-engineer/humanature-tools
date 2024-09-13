import { Client } from 'twilio/lib/base/BaseTwilio';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';

type TwilioClient = Client & {
  messages?: {
    create: (options: {
      body?: string;
      from?: string;
      to?: string;
    }) => Promise<void>;
  };
};

export default class TwillioService {
  _twillioSetup() {
    const client: TwilioClient = new Client(
      process.env.TWILLIO_ACCOUNT_SID,
      process.env.TWILLIO_AUTH_TOKEN,
    );

    client.messages?.create({
      body: 'Hello, world!',
      from: process.env.TWILLIO_PHONE_NUMBER,
      to: process.env.TWILLIO_PHONE_NUMBER,
    });
  }

  replyToText(bot_response: string) {
    return new MessagingResponse().message(bot_response).toString();
  }
}
