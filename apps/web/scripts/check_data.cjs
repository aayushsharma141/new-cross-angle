const fs = require('fs');
const files = ['AdminBlogOverview.tsx', 'AdminBlogPerformance.tsx', 'AdminBlogEngagement.tsx', 'CrmAnalytics.tsx', 'AdminQuizAnalytics.tsx'];
for (const f of files) {
  const content = fs.readFileSync('src/pages/admin/'+f, 'utf8');
  const dbCalls = (content.match(/\.from\(['"](\w+)['"]\)/g) || []);
  const tables = [...new Set(dbCalls.map(m => { const match = m.match(/\('(.+?)'\)/); return match ? match[1] : ''; }))].filter(Boolean);
  console.log(f, '| tables:', tables.join(', ') || 'NONE');
}
