#!/bin/bash
cd apps/web/public/images/projects
for file in $(find . -type f | sed 's|^./||'); do
  echo "Uploading $file"
  npx supabase storage cp "$file" "ss:///media/projects/$file" --experimental
done
