# Kindle Clippings Reader

A web application for browsing, organizing, and managing your Kindle highlights and notes.

## Features

- 📚 **Import Kindle Clippings** - Upload your `My Clippings.txt` file from your Kindle
- 🔍 **Browse by Book** - View all your books in a sidebar with clipping counts
- 📝 **Add & Edit Notes** - Add personal notes to highlights or edit existing ones
- 🗑️ **Delete Clippings** - Remove highlights that are no longer relevant
- 💾 **Export to JSON** - Save your curated collection for backup or sharing
- 📥 **Import JSON** - Load previously exported collections

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine

### Installation & Running

1. Clone this repository:
```bash
git clone <your-repo-url>
cd kindle-clippings-reader
```

2. Start the application:
```bash
docker-compose up
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

That's it! The app will hot-reload as you make changes to the code.

### Stopping the Application

Press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

## Usage

### Getting Your Kindle Clippings

1. Connect your Kindle to your computer via USB
2. Navigate to the `documents` folder on your Kindle
3. Find and copy the `My Clippings.txt` file

### Using the App

1. **Upload Clippings**: Click "Upload File" and select your `My Clippings.txt` file (or a previously exported JSON)
2. **Browse Books**: Click on any book in the sidebar to view its clippings
3. **Navigate**: Use Previous/Next buttons to move through clippings
4. **Add Notes**: Click "Add Note" to attach personal thoughts to a highlight
5. **Edit Notes**: Click "Edit" on existing notes to modify them
6. **Delete Clippings**: Click the "Delete" button to remove unwanted highlights
7. **Export**: Click "Export to JSON" to save your curated collection
   - Copy the JSON from the modal
   - Save it to a `.json` file for future use

### JSON Format

The exported JSON follows this structure:

```json
[
  {
    "title": "Book Title",
    "clippings": [
      {
        "metadata": "- Your Highlight on page 45 | Added on January 15, 2024",
        "content": "The highlighted text...",
        "note": "Your personal note (optional)"
      }
    ],
    "count": 5
  }
]
```

## Development

### Project Structure

```
kindle-clippings-reader/
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── index.html              # HTML entry point
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main application component
    └── index.css           # Global styles
```

### Making Changes

The application uses hot module replacement (HMR), so changes to the code will automatically reload in the browser. Edit `src/App.jsx` to modify the application logic and UI.

### Building for Production

To create a production build:

```bash
docker-compose run app npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Docker** - Containerization

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.