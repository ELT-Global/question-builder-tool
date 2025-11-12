# CSV Import Feature Documentation

## Overview
The CSV Import feature allows you to import multiple choice questions from CSV files or Google Sheets. Questions are **appended** to your existing questions (not replaced).

## Features

### 1. CSV File Upload
- Upload `.csv` files (max 5MB)
- Automatic validation of file structure
- Preview questions before importing
- Shows warnings for skipped rows

### 2. Google Sheets Import
- Import directly from Google Sheets URL
- Real-time data fetching
- Validates sheet accessibility
- Same preview and validation as CSV upload

## CSV Format Requirements

### Required Columns
- `question`: The question text (required)
- `Correct_Option_Indexes`: Comma-separated indexes of correct options (e.g., "1,3" for multiple correct answers)
- `Option_1_Text`, `Option_2_Text`, etc.: Option texts (minimum 2 options, maximum 10)

### Optional Columns
- `correct_answer-mark`: Marks awarded for correct answer (default: 1)
- `wrong_answer-mark`: Marks deducted for wrong answer (default: 0)
- `partial_answer-mark`: Marks for partially correct answer (default: 0)
- `solution`: Solution explanation text

### Example CSV Format

```csv
question,Correct_Option_Indexes,Option_1_Text,Option_2_Text,Option_3_Text,Option_4_Text,correct_answer-mark,wrong_answer-mark,partial-mark,solution
"Which of the following are assets in a company's balance sheet?","1,3,4",Cash,Accounts Payable,Inventory,Equipment,3,1,1,"Cash, inventory, and equipment represent resources owned by the company."
"What is the capital of France?",2,London,Paris,Berlin,Rome,3,1,0,"Paris is the capital of France."
```

## Question Type Detection

The system automatically detects question types:
- **Single Answer (mcq_single)**: When only one option is marked correct
- **Multiple Answer (mcq_multiple)**: When multiple options are marked correct

## Using CSV File Upload

1. Click **Import** dropdown in the navbar
2. Select **Import from CSV**
3. Choose **Upload CSV** tab
4. Click the upload area or drag & drop your CSV file
5. Review the preview of questions
6. Click **Import** to add questions to your project

## Using Google Sheets Import

### Step 1: Prepare Your Google Sheet
1. Create a Google Sheet with the required format (same as CSV)
2. Ensure the first row contains column headers
3. Add your questions in subsequent rows

### Step 2: Make Sheet Public
**Important**: The sheet must be publicly accessible for import to work.

1. Open your Google Sheet
2. Click the **Share** button (top right)
3. Click **Change to anyone with the link**
4. Set permission to **Viewer**
5. Click **Done**

### Step 3: Import from URL
1. Copy the Google Sheets URL (entire URL from browser)
2. Click **Import** dropdown in the navbar
3. Select **Import from CSV**
4. Choose **Google Sheets** tab
5. Paste the URL
6. Click **Import from Google Sheets**
7. Review the preview
8. Click **Import** to add questions

### Supported Google Sheets URL Formats
- `https://docs.google.com/spreadsheets/d/{id}/edit#gid={gid}`
- `https://docs.google.com/spreadsheets/d/{id}/edit`
- `https://docs.google.com/spreadsheets/d/{id}`

## Validation & Error Handling

### File Validation
- Checks file type (.csv only)
- Validates file size (max 5MB)
- Ensures file is not empty

### Structure Validation
- Verifies required columns exist
- Checks for minimum 2 options per question
- Validates correct option indexes
- Ensures at least one valid question

### Google Sheets Validation
- Validates URL format
- Checks if sheet is publicly accessible
- Provides clear error messages for private sheets
- Handles network errors gracefully

### Common Errors & Solutions

#### "Missing required columns"
- Ensure your CSV has `question` and `Correct_Option_Indexes` columns
- Check column names match exactly (case-sensitive)

#### "Access denied" (Google Sheets)
- Make sure the sheet is set to "Anyone with the link can view"
- Check that you're using the full URL from the browser

#### "No valid questions found"
- Verify each row has question text
- Ensure `Correct_Option_Indexes` contains valid numbers
- Check that at least 2 options are provided per question

#### Row Skipped Warnings
- Row has no question text
- Missing correct option indexes
- Less than 2 options provided
- No valid correct option found

## Preview Features

The preview modal shows:
- Question number and type (Single/Multiple Answer)
- Question text
- All options with correct answers highlighted in green
- Marks configuration (correct, wrong, partial)
- Solution text (if provided)
- Warning messages for any skipped rows

## Data Handling

### Appending vs Replacing
- CSV import **appends** questions (doesn't clear existing ones)
- ZIP import **replaces** all questions (after confirmation)

### Local Storage
- Imported questions are auto-saved to localStorage
- Draft is updated immediately after import
- Images are stored in IndexedDB (not applicable for CSV import)

## Best Practices

1. **Test with Sample Data**: Import a small CSV first to verify format
2. **Review Preview**: Always check the preview before importing
3. **Check Warnings**: Review any warning messages for skipped rows
4. **Backup**: Export your current questions before large imports
5. **Use UTF-8 Encoding**: Ensure CSV file is saved with UTF-8 encoding for special characters
6. **Quote Text**: Use quotes for text containing commas or special characters

## Limitations

1. **No Images**: CSV import doesn't support images (use ZIP import for images)
2. **No Scenarios**: CSV only supports MCQ questions (single and multiple)
3. **Max File Size**: CSV files limited to 5MB
4. **Max Questions**: Overall limit of 100 questions per project

## Sample CSV File

A sample CSV file (`sample-questions.csv`) is provided in the project root demonstrating the correct format.

## Troubleshooting

### Import Button Disabled
- Make sure you're on the correct tab (Upload CSV or Google Sheets)
- For file upload: Select a file first
- For Google Sheets: Enter a valid URL

### Questions Not Appearing
- Check browser console for errors
- Verify localStorage isn't full
- Try clearing browser cache

### Google Sheets Timeout
- Check your internet connection
- Verify the sheet URL is correct
- Ensure the sheet isn't too large

## Technical Details

### File Processing
- CSV parsing handles quoted values and escaped commas
- Validation runs before preview
- Questions are converted to internal format with UUID generation

### Google Sheets Integration
- Fetches data as CSV using Google Sheets export API
- No authentication required for public sheets
- Real-time data fetch (not cached)

### Data Format
Questions are converted to the internal JSON format:
```typescript
{
  id: string // UUID
  type: "mcq_single" | "mcq_multiple"
  question: string
  options: Array<{ id: string, text: string, correct: boolean }>
  marks: { correct: number, wrong: number, partial: number }
  images: []
  solution: string
}
```

## Support

For issues or questions:
1. Check validation errors in the preview
2. Verify CSV format matches documentation
3. Review browser console for detailed errors
4. Test with the provided sample CSV file
