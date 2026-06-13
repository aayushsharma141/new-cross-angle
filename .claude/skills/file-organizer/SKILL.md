---
name: file-organizer
description: Safely audits, cleans up junk (node_modules, temp files), and organizes user directories without touching critical system files.
---

# File Organizer Skill

This skill acts as a digital janitor. It provides workflows to clean up disk space and organize messy directories, with a strong focus on safety.

## Core Safety Rules
1. **Never touch system roots:** Do not modify `C:\Windows`, `C:\Program Files`, or `C:\ProgramData`. Never run automated file sorting recursively across entire root drives (like `C:\`, `D:\`, or `E:\`) as this will break installed software and games.
2. **Quarantine First:** When cleaning up temporary files, move them to a `Quarantine` folder rather than permanently deleting them immediately.
3. **Targeted Organization:** Only organize specific, loose-file user directories (like `Downloads` or `Desktop`). 

## Capabilities

### 1. Space Cleanup (The Junk Finder)
Finds and safely removes reproducible junk files.
- **Targets:** 
  - `node_modules` older than 30 days.
  - Temporary files (`%TEMP%`, `C:\Windows\Temp`) older than 7 days.
- **Action:** Scans target drives (C, D, E) and outputs CSV reports or safely quarantines junk.

### 2. File Sorter (The Clutter Organizer)
Organizes messy user folders by grouping loose files into categorized subfolders based on file extensions.
- **Categories:**
  - `Images/` (.jpg, .png, .gif)
  - `Documents/` (.pdf, .docx, .txt, .csv)
  - `Archives/` (.zip, .rar, .7z)
  - `Media/` (.mp4, .mp3, .mkv)
  - `Executables/` (.exe, .msi)
