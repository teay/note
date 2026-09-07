/**
 * Backup Script - Export Firestore data to JSON
 * อ่านข้อมูลทั้งหมดแล้วบันทึกเป็นไฟล์ JSON
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';

const COLLECTION_NAME = 'notes';
const BATCH_SIZE = 100;
const TIMESTAMP = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);

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

async function backupCollection(db) {
  const collectionRef = db.collection(COLLECTION_NAME);
  const allDocs = [];
  let lastDoc = null;

  console.log(`📂 Backing up collection: ${COLLECTION_NAME}\n`);

  while (true) {
    let query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    if (lastDoc) {
      query = collectionRef.orderBy('__name__').startAfter(lastDoc).limit(BATCH_SIZE);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      allDocs.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    process.stdout.write(`\r   Backed up: ${allDocs.length} documents...`);
  }

  console.log('\n');
  return allDocs;
}

async function main() {
  initFirebase();
  const db = getFirestore();
  const docs = await backupCollection(db);

  const filename = `backup-${COLLECTION_NAME}-${TIMESTAMP}.json`;
  writeFileSync(filename, JSON.stringify(docs, null, 2), 'utf8');

  console.log(`💾 Backup saved: ${filename}`);
  console.log(`   Total documents: ${docs.length}`);
  console.log(`   File size: ${(readFileSync(filename).length / 1024).toFixed(1)} KB`);
}

main().catch(console.error);