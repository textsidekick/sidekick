import { redirect } from 'next/navigation';
import { Effect } from 'react';

// Redirect to login page
export default function Page() {
  Effect(() => {
    redirect('/login');
  }, []);

  return null;
}
