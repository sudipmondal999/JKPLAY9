import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const fallbackUsername = (email ? email.split('@')[0] : `user_${uid.slice(0, 6)}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    const result = await db
      .insert(users)
      .values({
        uid,
        email: email || `${uid}@kingplay.auth`,
        name: name || fallbackUsername,
        username: fallbackUsername,
        avatarUrl: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`,
        role: email?.includes('admin') ? 'admin' : 'user',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          ...(email ? { email } : {}),
          ...(name ? { name } : {}),
          ...(avatar ? { avatarUrl: avatar } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Failed to synchronize user profile', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error('Database user fetch failed:', error);
    throw new Error('Failed to fetch user profile', { cause: error });
  }
}
