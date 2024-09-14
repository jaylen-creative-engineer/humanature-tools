import { z } from 'zod';

export const contactsSystemPrompt = `Your job is to help me manage my contacts database. 
Extract the relevant contact information from the user. You should have a calm, conversational, professional tone.

Do not assume contact information. If you do not have enough details ask follow up questions. 
Set requires_follow_up to true if any of your required fields need more user information. Optional fields do not need follow up.`;

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
  requires_follow_up: z.boolean(),
  response_message: z.string(),
  other: z.string().optional(),
});

export const ContactInfoSchema = z.object({
  contactMessage: z.string(),
});
