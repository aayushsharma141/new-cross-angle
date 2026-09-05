const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const map = {
  '\\[#faf8f5\\]': 'kiro-bg',
  '\\[#ffffff\\]': 'kiro-surface',
  '\\[#1a1a1a\\]': 'kiro-ink',
  '\\[#5a5a5a\\]': 'kiro-inkSoft',
  '\\[#e8e4dd\\]': 'kiro-line',
  '\\[#8b6f47\\]': 'kiro-accent',
  '\\[#f3ede2\\]': 'kiro-accentSoft',
  '\\[#d64545\\]': 'kiro-hard',
  '\\[#e89c3a\\]': 'kiro-soft',
  '\\[#d4b73a\\]': 'kiro-note',
  '\\[#4a8a5c\\]': 'kiro-good'
};

const dirs = [
  'apps/web/src/addons/calculators/components',
  'apps/web/src/addons/calculators/pages',
  'apps/web/src/addons/_shared'
];

let files = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) {
    files = files.concat(walkSync(d, []));
  }
});

let modifiedCount = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  for (let key in map) {
    let re = new RegExp(key, 'gi');
    content = content.replace(re, map[key]);
  }
  if (original !== content) {
    fs.writeFileSync(f, content);
    modifiedCount++;
    console.log('Updated', f);
  }
});
console.log('Modified files:', modifiedCount);
