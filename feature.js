#!/usr/bin/env node
// Usage:
//   node feature.js              -> list pending requests
//   node feature.js done <id>    -> mark request as done
//   node feature.js dismiss <id> -> mark request as dismissed

const TOKEN = process.env.YOL_ADMIN_SECRET || 'cbf0562879ce406907137ab3a4cacfcdcbc0d202ba2c3d06';
const BASE = 'https://api.t31k.cloud';

async function list() {
  const res = await fetch(`${BASE}/yol/admin/requests?variant=feature_request`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status}`, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function patch(id, status) {
  const res = await fetch(`${BASE}/yol/admin/requests/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status}`, await res.text());
    process.exit(1);
  }
  console.log(await res.text());
}

const [cmd, id] = process.argv.slice(2);
if (!cmd) list();
else if (cmd === 'done' && id) patch(id, 'done');
else if (cmd === 'dismiss' && id) patch(id, 'dismissed');
else {
  console.error('Usage: node feature.js [done|dismiss <id>]');
  process.exit(1);
}
