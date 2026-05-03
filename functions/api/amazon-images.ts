export interface Env {
  AMAZON_IMAGES: R2Bucket;
}

const getImageUrl = (key: string) => `/api/amazon-images?key=${encodeURIComponent(key)}`;

const buildObjectKey = (file: File) => {
  const extensionFromType =
    file.type === 'image/jpeg' ? 'jpg'
    : file.type === 'image/png' ? 'png'
    : file.type === 'image/webp' ? 'webp'
    : file.type === 'image/gif' ? 'gif'
    : 'bin';

  return `amazon/${crypto.randomUUID()}.${extensionFromType}`;
};

const badRequest = (message: string) => new Response(message, { status: 400 });

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const key = url.searchParams.get('key')?.trim();

    if (!key) {
      return badRequest('Missing image key');
    }

    const object = await env.AMAZON_IMAGES.get(key);
    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      return badRequest('Missing image file');
    }

    if (!image.type.startsWith('image/')) {
      return badRequest('Only image files are allowed');
    }

    const key = buildObjectKey(image);
    await env.AMAZON_IMAGES.put(key, image, {
      httpMetadata: {
        contentType: image.type,
      },
      customMetadata: {
        originalName: image.name,
      },
    });

    return Response.json({
      imageKey: key,
      imageUrl: getImageUrl(key),
    });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const key = url.searchParams.get('key')?.trim();

    if (!key) {
      return badRequest('Missing image key');
    }

    await env.AMAZON_IMAGES.delete(key);
    return Response.json({ ok: true });
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: {
      Allow: 'GET,POST,DELETE',
    },
  });
}
