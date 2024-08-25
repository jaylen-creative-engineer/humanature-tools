import { z } from "zod";

export const contactsSystemPrompt = `Extract the relevant contact information from the user. 
When you respond to the user, let them know that you have stored the information in their contacts database. 
Include a brief summary. If no next action is provided set it to "Follow up".`;

export const ContactsOutputResponseSchema = z.object({
  name: z.string(),
  location: z.string(),
  next_action: z.string(),
  email: z.string(),
  key_takeaway: z.string(),
  original_input: z.string(),
  response_message: z.string(),
  other: z.string(),
});

export const ContactInfoSchema = z.object({
  properties: z.object({
    contactInfo: z.string(),
  }),
});
