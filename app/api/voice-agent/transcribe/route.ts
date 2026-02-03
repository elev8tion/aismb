import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI API
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const file = new File([buffer], 'audio.webm', { type: audioFile.type });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: MODELS.transcription,
      response_format: 'json',
    });

    console.log('Transcription result:', transcription.text);

    return NextResponse.json({
      text: transcription.text,
      success: true,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout
