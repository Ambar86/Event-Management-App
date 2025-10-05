import { NextResponse } from 'next/server';
import sdk from 'node-appwrite';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, eventName, sponsor, userId } = body;

    const client = new sdk.Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || process.env.APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_PROJECTID || process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_ADMIN_KEY || process.env.APPWRITE_API_KEY || '');

    const databases = new sdk.Databases(client);

    const regDb = process.env.NEXT_PUBLIC_REGDB || process.env.REG_DB || '';
    const sponDb = process.env.NEXT_PUBLIC_SPODB || process.env.SPON_DB || '';

    // Create registration collection and attributes
    await databases.createCollection(regDb, eventId, eventName, [
      sdk.Permission.read(sdk.Role.any()),
      sdk.Permission.update(sdk.Role.any()),
      sdk.Permission.create(sdk.Role.any()),
      sdk.Permission.delete(sdk.Role.any()),
    ]);

    await databases.createStringAttribute(regDb, eventId, 'name', 50, false);
    await databases.createStringAttribute(regDb, eventId, 'email', 50, false);
    await databases.createStringAttribute(regDb, eventId, 'confirm', 50, false, '');

    // Create sponsor collection and attributes
    await databases.createCollection(sponDb, eventId, eventName, [
      sdk.Permission.read(sdk.Role.any()),
      sdk.Permission.update(sdk.Role.user(userId)),
      sdk.Permission.create(sdk.Role.user(userId)),
      sdk.Permission.delete(sdk.Role.user(userId)),
    ]);

    await databases.createStringAttribute(sponDb, eventId, 'name', 50, false);
    await databases.createStringAttribute(sponDb, eventId, 'url', 50, false);

    // Insert sponsor documents
    if (Array.isArray(sponsor)) {
      for (let i = 0; i < sponsor.length; i++) {
        const s = sponsor[i];
        await databases.createDocument(sponDb, eventId, sdk.ID.unique(), {
          name: s.name,
          url: s.url,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('create-collections error', err);
    return NextResponse.json({ success: false, error: err?.message || err }, { status: 500 });
  }
}
