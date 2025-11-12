# Data Field Migration Guide

## What Changed?

The following JSON field names have been updated throughout the application:

| Old Field Name | New Field Name | Description |
|---------------|----------------|-------------|
| `prompt` | `question` | Question text field |
| `positive` | `correct` | Marks for correct answers |
| `negative` | `wrong` | Marks for wrong answers |
| `explanation` | `solution` | Solution/explanation text |

## Automatic Migration

**Good news!** The application now automatically migrates your data:

### 1. **LocalStorage Draft** (Auto-migrated)
- When you open the app, any existing draft data is automatically detected and migrated
- The old format is converted to the new format seamlessly
- No action required from you!

### 2. **Imported ZIP Files** (Auto-migrated)
- When you import a ZIP file with old format data, it's automatically migrated
- Both old and new format files are supported
- No action required from you!

### 3. **Manual Export/Import**
- If you have exported JSON files with the old format, they will be automatically migrated when imported

## How It Works

The migration happens automatically in these scenarios:

1. **On App Load**: Your draft data is checked and migrated if needed
2. **On Import**: Imported data is checked and migrated if needed
3. **Silent Operation**: Migration happens in the background with console logs

## Console Logs

You'll see these messages when migration happens:

```
🔄 Migrating draft data from old format to new format...
✅ Migration complete: 5 questions migrated
```

## Backwards Compatibility

- ✅ Old format data is automatically converted
- ✅ New format data works immediately
- ✅ Mixed data (if any) is handled correctly
- ✅ No data loss during migration

## Example Migration

### Before (Old Format):
```json
{
  "id": "123",
  "type": "mcq_single",
  "prompt": "What is 2+2?",
  "marks": {
    "positive": 1,
    "negative": 0
  },
  "explanation": "Basic arithmetic"
}
```

### After (New Format):
```json
{
  "id": "123",
  "type": "mcq_single",
  "question": "What is 2+2?",
  "marks": {
    "correct": 1,
    "wrong": 0
  },
  "solution": "Basic arithmetic"
}
```

## Troubleshooting

If you encounter any issues:

1. **Clear browser cache** and reload the page
2. **Check console** (F12) for migration logs
3. **Export your data** before clearing to keep a backup
4. **Re-import** if needed - migration will run again

## Developer Notes

Migration code locations:
- `lib/migrate-data.ts` - Core migration logic
- `lib/storage.ts` - LocalStorage migration
- `lib/zip-import.ts` - ZIP import migration
- `lib/manual-migration.ts` - Manual migration utility (if needed)
