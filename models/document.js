const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database with WAL mode for better performance
const db = new Database(path.join(dataDir, 'documents.db'), { 
  verbose: console.log 
});
db.pragma('journal_mode = WAL');

// Create tables
const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS processed_documents (
    id INTEGER PRIMARY KEY,
    document_id INTEGER UNIQUE,
    title TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
createTable.run();

// Prepare statements for better performance
const insertDocument = db.prepare(
  'INSERT INTO processed_documents (document_id, title) VALUES (?, ?)'
);
const findDocument = db.prepare(
  'SELECT * FROM processed_documents WHERE document_id = ?'
);

module.exports = {
  addProcessedDocument(documentId, title) {
    try {
      insertDocument.run(documentId, title);
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  isDocumentProcessed(documentId) {
    try {
      const row = findDocument.get(documentId);
      return !!row;
    } catch (error) {
      console.error('Error checking document:', error);
      throw error;
    }
  },

  // Utility method to close the database connection
  closeDatabase() {
    db.close();
  }
};