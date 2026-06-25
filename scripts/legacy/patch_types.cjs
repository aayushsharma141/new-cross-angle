const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/web/src/integrations/supabase/types.ts');
let content = fs.readFileSync(file, 'utf8');

const regex = /media: \{\s*Row: \{[\s\S]*?Relationships: \[\]\s*\}/;

const replacement = `media_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          path: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          path: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          path?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }
      media_files: {
        Row: {
          id: string
          folder_id: string | null
          display_name: string
          file_name: string
          storage_provider: string | null
          storage_path: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          folder_id?: string | null
          display_name: string
          file_name: string
          storage_provider?: string | null
          storage_path: string
          mime_type?: string
          size_bytes?: number
          width?: number | null
          height?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          folder_id?: string | null
          display_name?: string
          file_name?: string
          storage_provider?: string | null
          storage_path?: string
          mime_type?: string
          size_bytes?: number
          width?: number | null
          height?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully replaced media with media_folders and media_files in types.ts");
} else {
    console.log("Regex did not match");
}
