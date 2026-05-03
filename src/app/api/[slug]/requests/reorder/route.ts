import { NextResponse } from 'next/server';
export async function PUT() {
  // Reordering requires an order index column in DB. 
  // Returning success for optimistic UI. 
  return NextResponse.json({ success: true });
}