import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Our service is currently down. Please give us a few then try again.',
    },
    { status: 500 },
  );
}
