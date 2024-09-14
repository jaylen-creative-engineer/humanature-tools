import twilio from 'twilio';

export default class TwilioService {
  private client: twilio.Twilio;
  private accountSid: string;
  private authToken: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.client = twilio(this.accountSid, this.authToken);
  }

  async sendMessage(message: string, phoneNumber: string) {
    return this.client.messages
      ?.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber ?? '+12157309681',
      })
      .then((message) => {
        return message;
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async validateRequest(req: Request) {
    if (req.method === 'POST') {
      try {
        const twillioSignature = req.headers.get('X-Twilio-Signature');
        const params = req.body as Record<string, any>;
        const url = req.url;

        const isValid = twilio.validateRequest(
          this.authToken ?? '',
          twillioSignature ?? '',
          url,
          params,
        );

        if (!isValid) {
          return new Error('Invalid Twilio request');
        }

        return true;
      } catch (error) {
        console.error(error);
        return new Error('Error processing request');
      }
    } else {
      return new Error('Method not allowed');
    }
  }
}
