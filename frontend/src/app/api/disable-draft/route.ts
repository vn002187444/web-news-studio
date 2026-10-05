import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

// Thoát chế độ nháp
export async function GET() {
  (await draftMode()).disable();
  redirect('/vi');
}
