import { type NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

async function proxyRequest(req: NextRequest, method: string) {
  const url = new URL(req.url);
  const targetPath = url.pathname.replace(/^\/api\/proxy/, '');
  const targetUrl = `${API_BASE}${targetPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = await req.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.arrayBuffer();

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy request failed', message: (error as Error).message },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT');
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE');
}
