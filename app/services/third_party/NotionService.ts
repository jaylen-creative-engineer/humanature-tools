import { fetcher } from "@/app/utils/fetcher";

export default class NotionService {
  async updateDatabase(ai_message: any) {
    return fetcher("https://api.notion.com/v1/pages/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-02-22",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.formatDatabasePage(ai_message)),
    })
      .then((result) => result.url)
      .catch((error) => {
        throw new Error(error);
      });
  }

  formatDatabasePage(ai_message: any) {
    return {
      parent: {
        database_id: "a7c425ee-c57a-45ac-9095-26b0a3e8cd9b",
      },
      properties: {
        Date: {
          id: "%3CjMw",
          type: "date",
          date: null,
        },
        Tag: {
          id: "%5EBA%5B",
          type: "select",
          select: null,
        },
        Status: {
          id: "~%3A%3Cl",
          type: "select",
          select: {
            id: "25e06a7f-9dc2-435f-862d-f14450126fab",
            name: "AI",
            color: "default",
          },
        },
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: ai_message.name,
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: ai_message.name,
              href: null,
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Location: ${ai_message.location}\n Next Action: ${ai_message.next_action}\n Email: ${ai_message.email}\n Key Takeaway: ${ai_message.key_takeaway}\n Original Input: ${ai_message.original_input}\n Response Message: ${ai_message.response_message}\n Other: ${ai_message.other}`,
                },
              },
            ],
          },
        },
      ],
    };
  }
}
