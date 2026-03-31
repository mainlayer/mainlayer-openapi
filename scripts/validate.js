#!/usr/bin/env node
/**
 * validate.js
 *
 * Validates the Mainlayer OpenAPI spec using @apidevtools/swagger-parser.
 * Exits with code 0 on success, 1 on failure.
 *
 * Usage:
 *   node scripts/validate.js
 *   node scripts/validate.js --spec path/to/custom.yaml
 */

'use strict';

const path = require('path');
const SwaggerParser = require('@apidevtools/swagger-parser');

// --- Parse CLI args --------------------------------------------------------

const args = process.argv.slice(2);
let specPath = path.resolve(__dirname, '..', 'openapi.yaml');

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--spec' || args[i] === '-s') && args[i + 1]) {
    specPath = path.resolve(args[i + 1]);
    i++;
  }
}

// --- Helpers ---------------------------------------------------------------

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';

function log(color, prefix, msg) {
  process.stdout.write(`${color}${prefix}${RESET} ${msg}\n`);
}

function info(msg)    { log(CYAN,   '[INFO]', msg); }
function success(msg) { log(GREEN,  '[PASS]', msg); }
function warn(msg)    { log(YELLOW, '[WARN]', msg); }
function error(msg)   { log(RED,    '[FAIL]', msg); }

// --- Validation ------------------------------------------------------------

async function validate() {
  info(`Validating spec: ${specPath}`);
  info('Using @apidevtools/swagger-parser');
  console.log('');

  let api;

  // Step 1: Parse & dereference
  try {
    api = await SwaggerParser.validate(specPath);
    success('Spec parsed and validated successfully.');
  } catch (err) {
    error('Spec validation failed:');
    error(err.message);
    if (err.details) {
      err.details.forEach((d) => error(`  - ${d.message} (${d.path})`));
    }
    process.exit(1);
  }

  // Step 2: Basic structural checks
  console.log('');
  info('Running structural checks...');

  const checks = [
    {
      label: 'openapi version is 3.1.x',
      pass: typeof api.openapi === 'string' && api.openapi.startsWith('3.1'),
    },
    {
      label: 'info.title is present',
      pass: Boolean(api.info && api.info.title),
    },
    {
      label: 'info.version is present',
      pass: Boolean(api.info && api.info.version),
    },
    {
      label: 'At least one server is defined',
      pass: Array.isArray(api.servers) && api.servers.length > 0,
    },
    {
      label: 'paths object is present',
      pass: Boolean(api.paths && Object.keys(api.paths).length > 0),
    },
    {
      label: 'bearerAuth security scheme is defined',
      pass: Boolean(
        api.components &&
        api.components.securitySchemes &&
        api.components.securitySchemes.bearerAuth
      ),
    },
    {
      label: 'At least 20 paths defined',
      pass: api.paths && Object.keys(api.paths).length >= 20,
    },
    {
      label: 'tags array is present',
      pass: Array.isArray(api.tags) && api.tags.length > 0,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    if (check.pass) {
      success(check.label);
      passed++;
    } else {
      error(check.label);
      failed++;
    }
  }

  // Step 3: Endpoint coverage check
  console.log('');
  info('Checking endpoint coverage...');

  const requiredPaths = [
    'POST /auth/register',
    'POST /auth/login',
    'GET /vendor',
    'POST /resources',
    'GET /resources',
    'GET /resources/{id}',
    'PUT /resources/{id}',
    'DELETE /resources/{id}',
    'POST /pay',
    'GET /entitlements',
    'GET /entitlements/check',
    'GET /discover',
    'GET /analytics/revenue',
    'GET /payments',
    'GET /subscriptions',
    'POST /subscriptions/{id}/cancel',
    'GET /api-keys',
    'POST /api-keys',
    'DELETE /api-keys/{id}',
    'GET /invoices',
    'GET /invoices/{id}',
    'POST /coupons',
    'GET /webhooks',
    'POST /webhooks',
  ];

  for (const endpoint of requiredPaths) {
    const [method, pathStr] = endpoint.split(' ');
    const methodLower = method.toLowerCase();
    const pathExists = api.paths && api.paths[pathStr];
    const operationExists = pathExists && api.paths[pathStr][methodLower];

    if (operationExists) {
      success(`${method} ${pathStr}`);
      passed++;
    } else {
      error(`${method} ${pathStr} — NOT FOUND in spec`);
      failed++;
    }
  }

  // Step 4: Summary
  console.log('');
  console.log('─'.repeat(60));
  const total = passed + failed;
  if (failed === 0) {
    success(`All ${total} checks passed.`);
    console.log('');
    info(`Title   : ${api.info.title}`);
    info(`Version : ${api.info.version}`);
    info(`Paths   : ${Object.keys(api.paths).length}`);
    info(`Tags    : ${(api.tags || []).map((t) => t.name).join(', ')}`);
    console.log('');
    success('Spec is valid and complete.');
    process.exit(0);
  } else {
    error(`${failed} of ${total} checks failed.`);
    console.log('');
    error('Fix the issues above and re-run: npm run validate');
    process.exit(1);
  }
}

validate().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
