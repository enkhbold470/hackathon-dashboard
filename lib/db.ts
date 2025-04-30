import { prisma } from './prisma'

/**
 * Legacy query function for backward compatibility
 * @deprecated Use prisma client directly instead
 */
export async function query(text: string, params: any[] = []) {
  console.warn('WARNING: Using deprecated query function. Consider migrating to Prisma client directly.')
  try {
    const start = Date.now();
    
    // For basic SELECT queries, we'll attempt to map to Prisma
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      console.log('Executed legacy query via Prisma', { text, params });
      // This is a very basic implementation - in practice you should use Prisma models directly
      const result = await prisma.$queryRawUnsafe(text, ...params);
      const duration = Date.now() - start;
      console.log('Query completed', { duration, rows: Array.isArray(result) ? result.length : 0 });
      return { rows: Array.isArray(result) ? result : [result] };
    }

    // For other queries, we'll pass through to raw query
    const result = await prisma.$queryRawUnsafe(text, ...params);
    const duration = Date.now() - start;
    console.log('Executed legacy query via Prisma', { text, duration });
    
    // Format the result to match the old query function
    return { 
      rows: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1
    };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Close database connections
 * @deprecated Use Prisma's $disconnect instead
 */
export async function closePool() {
  await prisma.$disconnect();
}

/**
 * Test the database connection
 */
export async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Database connection successful!', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
} 