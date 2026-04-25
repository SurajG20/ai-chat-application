import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const hashedPassword = await hashPassword(password);
    
    const [row] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();
    return row;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      throw new Error('User with this email already exists');
    }
    throw new Error('Database error while creating user');
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Database error while fetching user');
  }
}
