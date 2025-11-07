# Question Authoring & ZIP Export App

A production-ready Next.js application for creating structured exam questions with image uploads and ZIP export functionality.

## Features

- ✅ Multiple question types (MCQ single/multiple, Scenario, Short/Long answer)
- ✅ Marks management (positive, negative, partial)
- ✅ Multiple image uploads per question with validation
- ✅ Client-side ZIP export with JSZip
- ✅ Auto-save to localStorage
- ✅ Full TypeScript with Zod validation
- ✅ Clean, maintainable component architecture
- ✅ ESLint best practices

## Architecture

### Component-Level Logic
- **QuestionEditor**: Manages individual question form state and validation
- **ImageUploader**: Handles file uploads, validation, and preview display
- **ExportModal**: User input for ZIP filename and export trigger

### Utility Functions
- **lib/validation.ts**: Centralized Zod schemas and file validation
- **lib/storage.ts**: Simple localStorage operations
- **lib/zip.ts**: ZIP generation and download utilities
- **lib/types.ts**: TypeScript interfaces and types

### Design Principles
1. **Component-level logic**: Components manage their own state and behavior
2. **Focused utilities**: Utility functions are small, single-purpose helpers
3. **Clear separation**: UI logic stays in components, data operations in utils
4. **Type safety**: Full TypeScript with strict validation
5. **Maintainability**: Clear file structure, extensive comments, ESLint compliance

## Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Usage

1. **Create Questions**: Click "Add Question" to create a new question
2. **Configure**: Select type, add prompt, options (for MCQs), marks, and images
3. **Auto-save**: Questions are automatically saved to localStorage
4. **Export**: Click "Export ZIP" to download all questions and images

## Export Format

The ZIP file contains:
- `data.json`: Complete question data with metadata
- `<uuid>.ext`: All uploaded images with crypto-generated filenames

## Limitations

- Client-side only (no authentication or backend)
- Maximum file size: 5 MB per image
- Total size warning at 80 MB
- Supported formats: jpg, jpeg, png, gif, webp, svg

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Zod validation
- JSZip
- Tailwind CSS v4
- shadcn/ui components
