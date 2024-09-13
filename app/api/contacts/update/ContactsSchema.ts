import { z } from 'zod';

export const contactsSystemPrompt = `Extract the relevant contact information from the user. 
When you respond to the user, let them know that you have stored the information in their contacts database. 
Include a brief summary. If no next action is provided set it to "Follow up". 
Do not assume context. If you do not have enough details ask one follow up question.`;

export const ContactsOutputResponseSchema = z.object({
  name: z.string(),
  todays_date: z.string(),
  work_title: z.enum([
    'Chief Equity & Inclusion Offer',
    'Managing Director North America Corporate Citizenship',
    'Senior Program Officer',
    'Executive Director',
    'President',
    'President & CEO',
    'Director Economic Mobility Project',
    'Director of Workforce Policy',
    'Chief Executive Officer',
    'Program Officer',
    'Client Account Lead Comcast',
    'Partner & CEO',
    'Principal',
    'Chief Strategy Officer',
    'Vice President',
    'Leading Strategic Partnerships & Philanthropy',
    'Senior Strategist Environmental Equity Green Finance & Economic Development',
    'Managing Director',
    'Founder',
    'Investor',
    'Other',
  ]),
  company_name: z.string(),
  social_media_handles: z.string().optional(),
  connection_type: z.enum([
    'Client',
    'Partner',
    'Community',
    'Prospect',
    'Funder',
    'Corporate Sponsor',
    'Connector',
    'Contact',
    'Panelist',
  ]),
  next_action: z.string().optional(),
  email: z.string().optional(),
  bio: z.string().optional(),
  original_input: z.string(),
  additional_details_needed: z.string().optional(),
  response_message: z.string(),
  other: z.string().optional(),
});

export const ContactInfoSchema = z.object({
  contactMessage: z.string(),
});
