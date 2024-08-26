import { NextResponse } from 'next/server';

export function POST(req: Request) {
  console.log('req.body', JSON.stringify(req));
  return NextResponse.json(
    { message: 'This service ran into an error. Please try again later.' },
    { status: 500 },
  );
}
