import { NextResponse } from 'next/server';

export function GET(req: Request) {
  console.log('req.body', req.body);
  return NextResponse.json(
    { message: 'This service ran into an error. Please try again later.' },
    { status: 500 },
  );
}
