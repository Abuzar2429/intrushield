import { initDatabase, getDb } from '../db/database';

async function testSeed() {
  console.log('[SEED TEST] Verifying database tables and initial records...');
  await initDatabase();

  const db = getDb();
  
  const userCount = (db.exec('SELECT COUNT(*) as count FROM users')[0]?.values[0][0]) || 0;
  const incidentCount = (db.exec('SELECT COUNT(*) as count FROM incidents')[0]?.values[0][0]) || 0;
  const threatCount = (db.exec('SELECT COUNT(*) as count FROM threat_intel')[0]?.values[0][0]) || 0;

  console.log(`[SEED TEST] Database Status:`);
  console.log(` - Users: ${userCount}`);
  console.log(` - Incidents: ${incidentCount}`);
  console.log(` - Threat Intel IOCs: ${threatCount}`);

  if (userCount > 0 && incidentCount > 0 && threatCount > 0) {
    console.log('[SEED TEST] ✅ Database verification PASSED cleanly.');
    process.exit(0);
  } else {
    console.error('[SEED TEST] ❌ Database verification FAILED.');
    process.exit(1);
  }
}

testSeed().catch(err => {
  console.error('[SEED TEST] Error:', err);
  process.exit(1);
});
