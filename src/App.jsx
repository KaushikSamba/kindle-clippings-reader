import React, { useState } from 'react';
import { Book, ChevronLeft, ChevronRight, Upload, Download, Trash2, Edit2, Plus, Save, X, Grid, List } from 'lucide-react';

export default function KindleClippingsReader() {
    const [clippings, setClippings] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rawText, setRawText] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editedNote, setEditedNote] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [viewMode, setViewMode] = useState('bookshelf'); // 'bookshelf' or 'reading'

    const parseClippings = (text) => {
        const entries = text.split('==========').filter(entry => entry.trim());
        const bookMap = {};
        const processedEntries = [];

        entries.forEach(entry => {
            const lines = entry.trim().split('\n').filter(line => line.trim());
            if (lines.length >= 3) {
                const title = lines[0].trim();
                const metadata = lines[1].trim();
                const content = lines.slice(2).join('\n').trim();

                processedEntries.push({
                    title,
                    metadata,
                    content,
                    isNote: metadata.includes('Your Note')
                });
            }
        });

        // Link notes to their preceding highlights
        for (let i = 0; i < processedEntries.length; i++) {
            const entry = processedEntries[i];

            if (!bookMap[entry.title]) {
                bookMap[entry.title] = [];
            }

            // If this is a note, try to attach it to the previous highlight
            if (entry.isNote && i > 0 && processedEntries[i - 1].title === entry.title && !processedEntries[i - 1].isNote) {
                const prevEntry = bookMap[entry.title][bookMap[entry.title].length - 1];
                if (prevEntry) {
                    prevEntry.note = entry.content;
                }
            } else if (!entry.isNote) {
                // Regular highlight or bookmark
                bookMap[entry.title].push({
                    metadata: entry.metadata,
                    content: entry.content,
                    note: null,
                    timestamp: new Date()
                });
            }
        }

        const books = Object.entries(bookMap).map(([title, notes]) => ({
            title,
            notes,
            count: notes.length
        }));

        setClippings(books);
        if (books.length > 0) {
            setSelectedBook(books[0]);
            setCurrentIndex(0);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;

                // Check if it's JSON
                if (file.name.endsWith('.json')) {
                    try {
                        const data = JSON.parse(text);
                        setClippings(data);
                        if (data.length > 0) {
                            setSelectedBook(data[0]);
                            setCurrentIndex(0);
                        }
                        setRawText('');
                    } catch (error) {
                        alert('Invalid JSON file. Please upload a valid clippings JSON file.');
                    }
                } else {
                    // Treat as text clippings file
                    setRawText(text);
                    parseClippings(text);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleTextPaste = (e) => {
        const text = e.target.value;
        setRawText(text);
        if (text.includes('==========')) {
            parseClippings(text);
        }
    };

    const nextClipping = () => {
        if (selectedBook && currentIndex < selectedBook.notes.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevClipping = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const selectBook = (book) => {
        setSelectedBook(book);
        setCurrentIndex(0);
        setViewMode('reading');
    };

    const exportToJSON = () => {
        setShowExportModal(true);
    };

    const copyToClipboard = () => {
        const dataStr = JSON.stringify(clippings, null, 2);
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('JSON copied to clipboard! Save it to a .json file.');
        });
    };

    const deleteCurrentClipping = () => {
        if (!selectedBook) return;

        const updatedClippings = clippings.map(book => {
            if (book.title === selectedBook.title) {
                const newNotes = book.notes.filter((_, idx) => idx !== currentIndex);
                return {
                    ...book,
                    notes: newNotes,
                    count: newNotes.length
                };
            }
            return book;
        }).filter(book => book.notes.length > 0);

        setClippings(updatedClippings);

        // Update selected book and index
        const updatedBook = updatedClippings.find(book => book.title === selectedBook.title);
        if (updatedBook) {
            setSelectedBook(updatedBook);
            if (currentIndex >= updatedBook.notes.length) {
                setCurrentIndex(Math.max(0, updatedBook.notes.length - 1));
            }
        } else if (updatedClippings.length > 0) {
            setSelectedBook(updatedClippings[0]);
            setCurrentIndex(0);
        } else {
            setSelectedBook(null);
            setCurrentIndex(0);
        }
    };

    const startEditingNote = () => {
        const currentNote = selectedBook?.notes[currentIndex]?.note || '';
        setEditedNote(currentNote);
        setIsEditingNote(true);
    };

    const saveNote = () => {
        if (!selectedBook) return;

        const updatedClippings = clippings.map(book => {
            if (book.title === selectedBook.title) {
                const newNotes = book.notes.map((note, idx) => {
                    if (idx === currentIndex) {
                        return {
                            ...note,
                            note: editedNote.trim() || null
                        };
                    }
                    return note;
                });
                return {
                    ...book,
                    notes: newNotes
                };
            }
            return book;
        });

        setClippings(updatedClippings);
        const updatedBook = updatedClippings.find(book => book.title === selectedBook.title);
        setSelectedBook(updatedBook);
        setIsEditingNote(false);
    };

    const cancelEditingNote = () => {
        setIsEditingNote(false);
        setEditedNote('');
    };

    if (clippings.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <Book className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kindle Clippings Reader</h1>
                        <p className="text-gray-600">Upload or paste your "My Clippings.txt" file to get started</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="mb-6">
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                                    <span className="text-sm text-gray-600">Click to upload file</span>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt" />
                            </label>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or paste text</span>
                            </div>
                        </div>

                        <textarea
                            className="w-full h-48 mt-6 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Paste your Kindle clippings here..."
                            value={rawText}
                            onChange={handleTextPaste}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Export JSON</h3>
                            <p className="text-sm text-gray-600 mt-1">Copy this JSON and save it to a .json file</p>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <textarea
                                readOnly
                                value={JSON.stringify(clippings, null, 2)}
                                className="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded font-mono text-sm"
                            />
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'bookshelf' ? (
                <div className="min-h-screen p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Kindle Library</h1>
                                <p className="text-gray-600">{clippings.length} books with highlights</p>
                            </div>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg cursor-pointer hover:bg-amber-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Upload File
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.json" />
                                </label>
                                <button
                                    onClick={exportToJSON}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export JSON
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {clippings.map((book, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectBook(book)}
                                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                                            <Book className="w-8 h-8 text-amber-600" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-3 min-h-[4rem]">
                                        {book.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="bg-amber-50 px-3 py-1 rounded-full font-medium">
                                            {book.count} {book.count === 1 ? 'highlight' : 'highlights'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex h-screen">
                    <div className="w-80 bg-white shadow-lg overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Book className="w-6 h-6 text-amber-600" />
                                Your Books
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">{clippings.length} books</p>
                            <div className="mt-4 space-y-2">
                                <label className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-amber-600 text-white rounded-lg cursor-pointer hover:bg-amber-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Upload File
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.json" />
                                </label>
                                <button
                                    onClick={exportToJSON}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export to JSON
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            {clippings.map((book, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectBook(book)}
                                    className={`w-full text-left p-4 rounded-lg mb-2 transition-colors ${selectedBook?.title === book.title
                                            ? 'bg-amber-100 border-2 border-amber-500'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-800 mb-1 line-clamp-2">{book.title}</div>
                                    <div className="text-sm text-gray-600">{book.count} clippings</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="bg-white shadow-md p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedBook?.title}</h1>
                                    <p className="text-sm text-gray-600">
                                        Clipping {currentIndex + 1} of {selectedBook?.notes.length}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setViewMode('bookshelf')}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    <Grid className="w-4 h-4" />
                                    Back to Library
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-lg shadow-lg p-8">
                                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                                        <div className="text-xs text-gray-500">
                                            {selectedBook?.notes[currentIndex]?.metadata}
                                        </div>
                                        <button
                                            onClick={deleteCurrentClipping}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                    <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                                        {selectedBook?.notes[currentIndex]?.content}
                                    </div>

                                    {isEditingNote ? (
                                        <div className="mt-6 pt-6 border-t-2 border-amber-200">
                                            <div className="text-sm font-semibold text-amber-700 mb-2">Your Note:</div>
                                            <textarea
                                                value={editedNote}
                                                onChange={(e) => setEditedNote(e.target.value)}
                                                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                placeholder="Add your note here..."
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={saveNote}
                                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditingNote}
                                                    className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : selectedBook?.notes[currentIndex]?.note ? (
                                        <div className="mt-6 pt-6 border-t-2 border-amber-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-semibold text-amber-700">Your Note:</div>
                                                <button
                                                    onClick={startEditingNote}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="text-base leading-relaxed text-gray-700 bg-amber-50 p-4 rounded-lg whitespace-pre-wrap">
                                                {selectedBook.notes[currentIndex].note}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                            <button
                                                onClick={startEditingNote}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Note
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-md p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center max-w-3xl mx-auto">
                                <button
                                    onClick={prevClipping}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>
                                <button
                                    onClick={nextClipping}
                                    disabled={currentIndex === selectedBook?.notes.length - 1}
                                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}