
'use server';

import { NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'secret1');
const PUBLIC_PATH_PREFIX = '/secret1/';

// Log UPLOAD_DIR at server start (or first API call in dev mode)
console.log('[API Upload-Image] Server-side UPLOAD_DIR on init:', UPLOAD_DIR);

export async function POST(request: NextRequest) {
  console.log('[API Upload-Image] Received POST request');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('[API Upload-Image] File not found in request.');
      return NextResponse.json({ success: false, message: 'Файл не найден в запросе.' }, { status: 400 });
    }
    console.log('[API Upload-Image] File received:', file.name, file.type, file.size);

    if (file.size === 0) {
      console.error('[API Upload-Image] File is empty (0 bytes).');
      return NextResponse.json({ success: false, message: 'Файл пустой (0 байт).' }, { status: 400 });
    }

    if (!file.type.startsWith('image/jp')) { 
        console.warn('[API Upload-Image] Invalid file type on server:', file.type, '. Client-side validation should have caught this. Allowing processing but logging.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[API Upload-Image] File buffer created, size:', buffer.length, 'bytes');

    if (buffer.length === 0) {
        console.error('[API Upload-Image] File buffer is empty after conversion.');
        return NextResponse.json({ success: false, message: 'Буфер файла пуст после конвертации.' }, { status: 500 });
    }

    try {
      console.log('[API Upload-Image] Ensuring directory exists:', UPLOAD_DIR);
      await mkdir(UPLOAD_DIR, { recursive: true });
      const dirStats = await stat(UPLOAD_DIR); // Check after attempting to create
      if (!dirStats.isDirectory()) {
          console.error('[API Upload-Image] Upload path is not a directory after attempting to create it:', UPLOAD_DIR);
          throw new Error('Upload path is not a directory after attempting to create it.');
      }
      console.log('[API Upload-Image] Directory ensured/created and verified as directory:', UPLOAD_DIR);
    } catch (dirError: any) {
      if (dirError.code !== 'EEXIST') { // EEXIST is fine, means directory already exists
        console.error('[API Upload-Image] Critical error creating or verifying directory:', dirError.message, dirError.stack);
        return NextResponse.json({ success: false, message: `Ошибка создания или проверки директории на сервере: ${dirError.message}` }, { status: 500 });
      }
      console.log('[API Upload-Image] Directory already exists (EEXIST ignored), proceeding:', UPLOAD_DIR);
    }

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    console.log('[API Upload-Image] Target file path for writing:', filePath);

    try {
      console.log('[API Upload-Image] Attempting to write file to disk...');
      await writeFile(filePath, buffer);
      console.log('[API Upload-Image] File write operation completed for path:', filePath);
      
      const fileStats = await stat(filePath); // Verify file was written and is not empty
      if (fileStats.size === 0) {
          console.error('[API Upload-Image] CRITICAL: File written to disk but is 0 bytes. Path:', filePath);
          // Consider returning an error if file is 0 bytes.
          // return NextResponse.json({ success: false, message: 'Файл записан на диск, но его размер 0 байт.' }, { status: 500 });
      } else {
          console.log('[API Upload-Image] File successfully written to disk and verified. Path:', filePath, 'Size:', fileStats.size, 'bytes.');
      }

    } catch (writeFileError: any) {
      console.error('[API Upload-Image] CRITICAL ERROR WRITING FILE:', writeFileError.message, writeFileError.stack);
      console.error('[API Upload-Image] File path attempted:', filePath);
      console.error('[API Upload-Image] Buffer length:', buffer.length);
      return NextResponse.json({ success: false, message: `Критическая ошибка записи файла на сервере: ${writeFileError.message}` }, { status: 500 });
    }
    
    const publicUrl = `${PUBLIC_PATH_PREFIX}${filename}`;
    console.log('[API Upload-Image] Public URL for client:', publicUrl);

    // Increased delay
    await new Promise(resolve => setTimeout(resolve, 300)); 

    return NextResponse.json({ success: true, url: publicUrl, message: 'Файл успешно загружен.' });

  } catch (error: any) {
    console.error('[API Upload-Image] General error in POST handler:', error.message, error.stack);
    let errorMessage = 'Произошла неизвестная ошибка при загрузке файла.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
     if (error?.code === 'ETOOBIG' || error?.type === 'FileTooLargeError' || (error.message && error.message.includes("too large"))) {
        errorMessage = 'Файл слишком большой.';
        console.error('[API Upload-Image] FileTooLargeError or similar detected.');
        return NextResponse.json({ success: false, message: errorMessage }, { status: 413 }); 
    }

    return NextResponse.json({ success: false, message: `Общая ошибка на сервере: ${errorMessage}` }, { status: 500 });
  }
}
