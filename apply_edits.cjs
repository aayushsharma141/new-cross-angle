const fs = require('fs');
const edits = JSON.parse(fs.readFileSync('edits.json', 'utf8'));
let success = 0, failed = 0;

edits.forEach((e, index) => {
  const target = e.target;
  let content = fs.readFileSync(target, 'utf8');
  const args = e.args;
  
  if (args.ReplacementChunks) {
    let newContent = content;
    args.ReplacementChunks.forEach((chunk, cIndex) => {
      const { TargetContent, ReplacementContent } = chunk;
      if (newContent.includes(TargetContent)) {
        newContent = newContent.replace(TargetContent, ReplacementContent);
      } else {
        console.log(`Edit ${index} chunk ${cIndex} failed: Target string not found in ${target}`);
      }
    });
    if (newContent !== content) {
      fs.writeFileSync(target, newContent, 'utf8');
      success++;
    } else {
      failed++;
    }
  } else if (args.TargetContent && args.ReplacementContent) {
    if (content.includes(args.TargetContent)) {
      content = content.replace(args.TargetContent, args.ReplacementContent);
      fs.writeFileSync(target, content, 'utf8');
      success++;
    } else {
      console.log(`Edit ${index} failed: Target string not found in ${target}`);
      failed++;
    }
  }
});
console.log(`Done. ${success} applied, ${failed} failed.`);
