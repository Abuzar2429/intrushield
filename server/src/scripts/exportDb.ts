import { initDatabase, saveDb } from '../db/database';

/**
 * CLI Utility script to create a fresh SQLite database snapshot export.
 */
async function runExport() {
  console.log('[SCRIPT] Starting IntruShield SQLite snapshot export...');
  await initDatabase();
  saveDb();
  console.log('[SCRIPT] SQLite database snapshot exported successfully.');
  process.exit(0);
}

runExport().catch(err => {
  console.error('[SCRIPT ERROR] Export failed:', err);
  process.exit(1);
});
