/**
 * Restore Script - Restore original data from backup
 * ⚠️ จะเขียนทับข้อมูลปัจจุบัน!
 */

import { readFileSync } from 'fs';

const envContent = readFileSync('./.env', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    process.env[key.trim()] = valueParts.join('=').trim();
  }
}

const { initializeApp, cert } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
const { createInterface } = await import('readline');

const COLLECTION_NAME = 'notes';
const FIELD_NAME = 'content';
const BATCH_SIZE = 500;

function initFirebase() {
  try {
    const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
    console.log('✅ Firebase initialized\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🔄 Restore Data from Backup\n');

  initFirebase();

  const backupFile = process.argv[2];
  if (!backupFile) {
    console.log('Usage: node restore-data.mjs <backup-file.json>');
    console.log('Example: node restore-data.mjs backup-notes-2026-09-07-16-18-27.json');
    process.exit(1);
  }

  const backup = JSON.parse(readFileSync(backupFile, 'utf8'));
  console.log(`📂 Loaded ${backup.length} documents from ${backupFile}\n`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const confirmed = await new Promise((resolve) => {
    rl.question('⚠️  ยืนยันการ restore ข้อมูล? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });

  if (!confirmed) {
    console.log('❌ ยกเลิก');
    process.exit(0);
  }

  const db = getFirestore();
  const collectionRef = db.collection(COLLECTION_NAME);

  let totalRestored = 0;
  let lastDoc = null;

  while (true) {
    const batch = db.batch();
    let batchCount = 0;

    for (const item of backup) {
      const docRef = collectionRef.doc(item.id);
      const data = { [FIELD_NAME]: item[FIELD_NAME] || item.content || '' };
      batch.set(docRef, data, { merge: true });
      batchCount++;
      totalRestored++;

      if (batchCount >= BATCH_SIZE) break;
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`   💾 Restored ${totalRestored} documents...`);
    }

    if (batchCount < BATCH_SIZE) break;
  }

  console.log(`\n✅ Restore สำเร็จ! ${totalRestored} documents`);
}

main().catch(console.error);
