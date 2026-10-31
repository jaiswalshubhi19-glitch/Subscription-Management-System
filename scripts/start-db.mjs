import EmbeddedPostgres from 'embedded-postgres';

async function main() {
  console.log('🚀 Starting local PostgreSQL database on port 5432...');
  const pg = new EmbeddedPostgres({
    port: 5432,
    databaseDir: './.pgdata',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await pg.initialise();
  } catch {
    // Already initialized
  }

  await pg.start();
  console.log('✅ PostgreSQL database is running on port 5432 (database: subscriptiq)');
}

main().catch((err) => {
  console.error('Failed to start database:', err);
});
