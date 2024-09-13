export const crmPropertyMap: Record<string, (value: string) => any> = {
  Email: (value) => ({ email: value || 'n/a' }),
  'WWFL Projects': () => ({ relation: [] }),
  'Date Added': () => ({
    rich_text: [
      {
        text: {
          content: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      },
    ],
  }),
  Title: (value) => ({
    multi_select: value
      ? value.split(',').map((item) => ({ name: item.trim() }))
      : [],
  }),
  'Company Name': (value) => ({
    rich_text: [{ text: { content: value || '' } }],
  }),
  Connection: (value) => ({ select: value ? { name: value } : null }),
  Bio: (value) => ({ rich_text: [{ text: { content: value || '' } }] }),
  'Tasks 1': () => ({ relation: [] }),
  'Social Handles': (value) => ({
    files: value
      ? value.split(',').map((handle) => {
          const [platform, url] = handle.split(':').map((s) => s.trim());
          return {
            name: platform,
            type: 'external',
            external: { url },
          };
        })
      : [],
  }),
  'HN External Projects ': () => ({ relation: [] }),
  'Task Status': () => ({ rich_text: [{ text: { content: 'To Do' } }] }),
  Name: (value) => ({ title: [{ text: { content: value || '' } }] }),
};
