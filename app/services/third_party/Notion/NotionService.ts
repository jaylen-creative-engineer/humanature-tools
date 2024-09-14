import { Client } from '@notionhq/client';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';
import { crmPropertyMap } from './NotionPropertyMap';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default class NotionService {
  async updateCRMDatabase(ai_message: AICRMResponse) {
    try {
      const response = await notion.pages.create(
        this.formatCRMPage(ai_message),
      );
      console.log('Notion Updated');
      return response;
    } catch (error) {
      throw new Error(`Notion Error: ${error}`);
    }
  }

  formatCRMPage(ai_message: AICRMResponse): CreatePageParameters {
    return {
      parent: { database_id: process.env.DATABASE_ID || '' },
      properties: Object.entries(crmPropertyMap).reduce(
        (acc, [key, formatter]) => {
          let value;
          if (key === 'Title') {
            value = ai_message.work_title || '';
          } else if (key === 'Social Handles') {
            value = ai_message.social_media_handles || '';
          } else if (key === 'Connection') {
            value = ai_message.connection_type || '';
          } else {
            value = ai_message[key.toLowerCase().replace(/\s+/g, '_')] || '';
          }

          acc[key] = formatter(value);
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }
}
