/**
 * Dry-Run Audit Script for Firebase Firestore
 * ตรวจสอบข้อมูลก่อนทำ Sanitization - Read-Only Mode
 * ห้ามแก้ไขข้อมูลจริงเด็ดขาด
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { sanitizeForStorage, maskRtspPassword } from './text-sanitizer.mjs';

// ==================== CONFIG ====================
const COLLECTION_NAME = 'notes';
const FIELD_NAME = 'content';
const BATCH_SIZE = 100;
// ================================================

const RTSP_CREDENTIAL_REGEX = /rtsp:\/\/([^:]+):([^@]+)@([^\s<>"'`]+)/i;
const XSS_SCRIPT_REGEX = /<script[\s>]/i;
const XSS_EVENT_REGEX = /on\w+\s*=/i;

// ==================== INITIALIZE ====================
function initFirebase() {
  try {
    const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
    console.log('✅ Firebase initialized (Read-Only Mode)\n');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }
}

// ==================== AUDIT CHECKS ====================
function auditDocument(doc) {
  const data = doc.data();
  const text = data[FIELD_NAME] || '';
  const issues = [];
  const sanitized = sanitizeForStorage(text);
  const changed = sanitized !== text;

  // Check 1: RTSP with password
  if (RTSP_CREDENTIAL_REGEX.test(text)) {
    const masked = text.replace(
      RTSP_CREDENTIAL_REGEX,
      (_m, username, _password, rest) => `rtsp://${username}:****@${rest}`
    );
    issues.push({
      type: 'RTSP_PASSWORD',
      severity: 'HIGH',
      before: text,
      after: masked,
    });
  }

  // Check 2: XSS <script> tags
  if (XSS_SCRIPT_REGEX.test(text)) {
    issues.push({
      type: 'XSS_SCRIPT',
      severity: 'CRITICAL',
      before: text,
      after: sanitized,
    });
  }

  // Check 3: XSS event handlers
  if (XSS_EVENT_REGEX.test(text)) {
    issues.push({
      type: 'XSS_EVENT_HANDLER',
      severity: 'HIGH',
      before: text,
      after: sanitized,
    });
  }

  return {
    id: doc.id,
    text,
    sanitized,
    changed,
    hasIssues: issues.length > 0,
    issues,
  };
}

// ==================== PREVIEW ====================
function printPreview(result, maxPreview = 150) {
  console.log(`\n📋 Document: ${result.id}`);
  console.log(`   Changed: ${result.changed ? '✅ YES' : '⏭️  NO'}`);

  if (result.changed) {
    console.log(`   Before (${result.text.length} chars): ${result.text.substring(0, maxPreview)}${result.text.length > maxPreview ? '...' : ''}`);
    console.log(`   After  (${result.sanitized.length} chars): ${result.sanitized.substring(0, maxPreview)}${result.sanitized.length > maxPreview ? '...' : ''}`);
  }

  for (const issue of result.issues) {
    const severityIcon = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    }[issue.severity] || '⚪';

    console.log(`   ${severityIcon} [${issue.severity}] ${issue.type}`);
  }
}

// ==================== SUMMARY ====================
function printSummary(stats, totalDocs) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total documents scanned:        ${totalDocs}`);
  console.log(`   Would be changed:               ${stats.totalChanged}`);
  console.log(`   Unchanged (already clean):       ${stats.totalUnchanged}`);
  console.log('');
  console.log(`   🔴 XSS Script tags:             ${stats.xssScript}`);
  console.log(`   🟠 XSS Event handlers:          ${stats.xssEvent}`);
  console.log(`   🟠 RTSP with password:           ${stats.rtspPassword}`);
  console.log('='.repeat(60));

  if (stats.totalChanged === 0) {
    console.log('\n✅ ไม่พบข้อมูลที่ต้องแก้ไข - ข้อมูลปลอดภัยอยู่แล้ว');
  } else {
    console.log(`\n⚠️  พบ ${stats.totalChanged} รายการที่จะเปลี่ยนแปลง`);
    console.log('   ควรรัน migration script หลังจากนี้');
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('🔍 Firebase Firestore - Dry-Run Audit');
  console.log('   Mode: READ-ONLY (ไม่แก้ไขข้อมูลจริง)');
  console.log('   Method: sanitize-html allowlist (preserves safe tags)\n');

  initFirebase();

  const db = getFirestore();
  const collectionRef = db.collection(COLLECTION_NAME);

  let totalDocs = 0;
  let lastDoc = null;
  const stats = {
    totalChanged: 0,
    totalUnchanged: 0,
    rtspPassword: 0,
    xssScript: 0,
    xssEvent: 0,
  };

  const problematicDocs = [];

  console.log(`📂 Scanning collection: ${COLLECTION_NAME}`);
  console.log(`   Field: ${FIELD_NAME}\n`);

  while (true) {
    let query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    if (lastDoc) {
      query = collectionRef.orderBy('__name__').startAfter(lastDoc).limit(BATCH_SIZE);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      totalDocs++;
      const result = auditDocument(doc);

      if (result.changed) {
        stats.totalChanged++;
      } else {
        stats.totalUnchanged++;
      }

      for (const issue of result.issues) {
        if (issue.type === 'RTSP_PASSWORD') stats.rtspPassword++;
        if (issue.type === 'XSS_SCRIPT') stats.xssScript++;
        if (issue.type === 'XSS_EVENT_HANDLER') stats.xssEvent++;
      }

      if (result.hasIssues || result.changed) {
        problematicDocs.push(result);
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    process.stdout.write(`\r   Scanned: ${totalDocs} documents...`);
  }

  console.log('\n');

  if (problematicDocs.length > 0) {
    console.log('⚠️  CHANGED / PROBLEMATIC DOCUMENTS:');
    console.log('-'.repeat(60));
    for (const doc of problematicDocs.slice(0, 20)) {
      printPreview(doc);
    }
    if (problematicDocs.length > 20) {
      console.log(`\n   ... and ${problematicDocs.length - 20} more documents`);
    }
  }

  printSummary(stats, totalDocs);
}

main().catch(console.error);
