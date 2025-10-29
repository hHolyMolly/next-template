'use client';

import Error from 'next/error';

function RootNotFoundPage() {
  return <Error statusCode={404} />;
}

export default RootNotFoundPage;
