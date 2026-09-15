'use strict';

/**
 * run-newman.js — Cross-platform Newman runner.
 *
 * Uses the Newman Node.js API directly so there's no shell binary
 * path issue on Windows vs Linux/macOS.
 *
 * Usage (via npm scripts):
 *   npm test           → seed + run collection + generate HTML report
 *   npm test:ci        → seed + run + HTML + sql-validation
 *   node scripts/run-newman.js --verbose   → CLI reporter only
 */

const newman = require('newman');
const path   = require('path');
const fs     = require('fs');

const ROOT        = path.join(__dirname, '..');
const COLLECTION  = path.join(ROOT, 'tests', 'TaskManagerAPI.postman_collection.json');
const ENVIRONMENT = path.join(ROOT, 'tests', 'TaskManager.postman_environment.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const REPORT_FILE = path.join(REPORTS_DIR, 'test-report.html');

const args    = process.argv.slice(2);
const verbose = args.includes('--verbose');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// ── Build reporter config ─────────────────────────────────────────────────────
const reporters = verbose ? ['cli'] : ['htmlextra'];

const reporterOptions = {
  htmlextra: {
    export:         REPORT_FILE,
    title:          'Task Manager API — Test Report',
    browserTitle:   'Task Manager API Tests',
  },
};

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('\n▶  Running Newman collection...\n');

newman.run(
  {
    collection:       require(COLLECTION),
    environment:      require(ENVIRONMENT),
    reporters,
    reporter:         reporterOptions,
    bail:             true,       // stop on first failure in CI
  },
  function (err, summary) {
    if (err) {
      console.error('\n❌  Newman run error:', err.message);
      process.exit(1);
    }

    const { stats } = summary.run;
    const failures  = summary.run.failures.length;

    console.log('\n────────────────────────────────────────────────');
    console.log(`  Requests   : ${stats.requests.total}  (failed: ${stats.requests.failed})`);
    console.log(`  Assertions : ${stats.assertions.total}  (failed: ${stats.assertions.failed})`);
    console.log(`  Failures   : ${failures}`);
    console.log('────────────────────────────────────────────────');

    if (!verbose && fs.existsSync(REPORT_FILE)) {
      console.log(`\n📄  HTML report → ${REPORT_FILE}`);
    }

    if (failures > 0 || stats.assertions.failed > 0) {
      console.error(`\n❌  ${failures} test(s) failed.\n`);
      process.exit(1);
    }

    console.log(`\n✅  All ${stats.assertions.total} assertions passed!\n`);
    process.exit(0);
  }
);
