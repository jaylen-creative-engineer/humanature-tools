import { NextResponse } from 'next/server';

export function POST(req: Request) {
  console.log('req.body', JSON.stringify(req));

  return NextResponse.json(
    {
      message:
        'Your message was successfully sent. Thank you for your feedback.',
    },
    { status: 200 },
  );
}
