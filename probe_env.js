import fs from 'fs';
const keys = Object.keys(process.env);
const report = keys.map(k => {
  const v = process.env[k] || '';
  return `${k}: len=${v.length}, prefix=${v.substring(0, 5)}...`;
}).join('\n');
fs.writeFileSync('detailed_env.log', report);
console.log('Detailed env report written to detailed_env.log');
