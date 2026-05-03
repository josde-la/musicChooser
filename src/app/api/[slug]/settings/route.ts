import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/settings';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const newSettings = await request.json();
  const current = await getSettings();
  await saveSettings({ ...current, ...newSettings });
  return NextResponse.json({ success: true });
}