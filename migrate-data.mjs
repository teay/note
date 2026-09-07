/**
 * Migration Script - Sanitize Old Data in Firebase Firestore
 * ⚠️ เขียนทับข้อมูลจริง - สำรองข้อมูลก่อนรันทุกครั้ง!
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { sanitizeForStorage } from './text-sanitizer.mjs';

// ==================== CONFIG ====================
const COLLECTION_NAME = 'notes';
const FIELD_NAME = 'content';
const BATCH_SIZE = 500;
const DRY_RUN = false; // แก้ไขจริง - ข้อมูล backup แล้ว
// ================================================

// ==================== FIREBASE ====================
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

async function confirmMigration(db) {
  const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
  if (snapshot.empty) {
    console.log('📭 Collection is empty - nothing to migrate');
    process.exit(0);
  }

  if (DRY_RUN) {
    console.log('🧪 DRY-RUN MODE - จะไม่แก้ไขข้อมูลจริง\n');
    return true;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('⚠️  ยืนยันการแก้ไขข้อมูลจริง? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// ==================== MIGRATION ====================
async function migrateCollection(db) {
  const collectionRef = db.collection(COLLECTION_NAME);
  let totalProcessed = 0;
  let totalChanged = 0;
  let totalUnchanged = 0;
  let lastDoc = null;
  const errors = [];
  const changedDocs = [];

  console.log(`📂 Migrating collection: ${COLLECTION_NAME}`);
  console.log(`   Field: ${FIELD_NAME}\n`);

  while (true) {
    let query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    if (lastDoc) {
      query = collectionRef.orderBy('__name__').startAfter(lastDoc).limit(BATCH_SIZE);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      totalProcessed++;
      const data = doc.data();
      const originalText = data[FIELD_NAME] || '';

      const sanitized = sanitizeForStorage(originalText);

      if (sanitized !== originalText) {
        batch.update(doc.ref, { [FIELD_NAME]: sanitized });
        batchCount++;
        totalChanged++;
        changedDocs.push({ id: doc.id, before: originalText, after: sanitized });
        console.log(`   ✅ CHANGED: ${doc.id}`);
      } else {
        totalUnchanged++;
        console.log(`   ⏭️  UNCHANGED: ${doc.id}`);
      }
    }

    if (batchCount > 0 && !DRY_RUN) {
      try {
        await batch.commit();
        console.log(`   💾 Committed ${batchCount} documents\n`);
      } catch (error) {
        console.error(`   ❌ Batch commit failed:`, error.message);
        errors.push({ batch: totalProcessed, error: error.message });
      }
    } else if (batchCount > 0 && DRY_RUN) {
      console.log(`   🧪 Would commit ${batchCount} documents (DRY-RUN)\n`);
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  return { totalProcessed, totalChanged, totalUnchanged, errors, changedDocs };
}

// ==================== PREVIEW ====================
function printPreview(changedDocs, maxShow = 10) {
  if (changedDocs.length === 0) return;

  console.log('\n📋 Changed Documents Preview:');
  console.log('-'.repeat(60));
  for (const doc of changedDocs.slice(0, maxShow)) {
    console.log(`\n   ID: ${doc.id}`);
    console.log(`   Before: ${doc.before.substring(0, 120)}${doc.before.length > 120 ? '...' : ''}`);
    console.log(`   After:  ${doc.after.substring(0, 120)}${doc.after.length > 120 ? '...' : ''}`);
  }
  if (changedDocs.length > maxShow) {
    console.log(`\n   ... and ${changedDocs.length - maxShow} more`);
  }
}

// ==================== SUMMARY ====================
function printSummary(stats) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total documents processed:  ${stats.totalProcessed}`);
  console.log(`   Changed (sanitized):        ${stats.totalChanged}`);
  console.log(`   Unchanged (already clean):   ${stats.totalUnchanged}`);
  console.log(`   Errors:                     ${stats.errors.length}`);
  console.log('='.repeat(60));

  printPreview(stats.changedDocs);

  if (DRY_RUN) {
    console.log('\n🧪 เสร็จสิ้น DRY-RUN MODE');
    console.log('   เปลี่ยน DRY_RUN = false แล้วรันใหม่เพื่อแก้ไขจริง');
  } else if (stats.errors.length === 0) {
    console.log('\n✅ Migration สำเร็จทั้งหมด!');
  } else {
    console.log('\n⚠️  มีบาง batch ที่ล้มเหลว - ตรวจสอบ log อีกครั้ง');
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('🔄 Firebase Firestore - Data Migration');
  console.log('   Sanitize old data for security (using sanitize-html allowlist)\n');

  initFirebase();

  const db = getFirestore();

  const confirmed = await confirmMigration(db);
  if (!confirmed) {
    console.log('❌ ยกเลิกการ Migration');
    process.exit(0);
  }

  const stats = await migrateCollection(db);
  printSummary(stats);
}

main().catch(console.error);
