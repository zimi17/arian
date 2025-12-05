# ARIAN - Analisis Tekstual Riset Axial Naratif

A sophisticated pure frontend qualitative research application for performing Grounded Theory analysis, developed for PDIA (Penelitian) at Universitas Jenderal Soedirman. All analysis is performed using client-side JavaScript algorithms.

## Key Features

### 1. Pure Frontend Architecture
- **No backend server required** - Works completely offline
- **Client-side processing only** - All analysis happens in the browser
- **IndexedDB + localStorage** - Robust data persistence without external databases
- **100% Private** - Your research data never leaves your computer

### 2. Grounded Theory Analysis Pipeline

#### Open Coding
Automatic extraction of codes using N-gram analysis:
- Unigrams (single words)
- Bigrams (two-word phrases)  
- Trigrams (three-word phrases)
- Frequency-based ranking
- Indonesian stopword filtering

#### Axial Coding
Clustering codes into categories based on:
- Co-occurrence patterns
- Statistical relationships
- Centrality measures

#### Selective Coding
Theory generation through:
- Core category identification
- Relationship mapping
- Narrative generation

### 3. Advanced NLP Processing (Client-Side)
All NLP is performed locally using custom algorithms:
- Custom tokenization and text cleaning
- Multi-gram extraction (1-3 word phrases)
- Indonesian language stopword filtering
- Co-occurrence analysis
- Frequency-based ranking

**Important**: Despite any references to AI services in configuration files, this application does NOT use external APIs. All processing is 100% local.

### 4. Rich UI Features
- **Ribbon-based interface** with contextual actions
- **Project management** - Create and manage multiple research projects
- **Word cloud visualization** - Visual representation of code frequencies
- **Multiple import formats** - Text, JSON, CSV, and file upload
- **Export/Import** - Backup and share your projects
- **Responsive design** - Works on desktop and tablet

### 5. Data Management
- **Project-based organization** - Keep different studies separate
- **Comprehensive metadata** - Track creation and update times
- **Import/Export** - Full project backup and restore
- **Local-only storage** - Complete data privacy

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. **Create a Project**
   - Click "New" in the File ribbon
   - Enter project name and description
   - Click "Create Project"

2. **Add Data**
   - Click "Add Data" in the Data ribbon
   - Choose input method:
     - Text input (one item per line)
     - File upload (CSV, JSON, or TXT)
   - Add your research data

3. **Run Analysis**
   - Click "Analyze" in the Data ribbon
   - The application will perform:
     - Open Coding (code extraction)
     - Axial Coding (categorization)
     - Selective Coding (theory generation)

4. **Review Results**
   - View extracted codes in table and word cloud
   - Explore categories and their relationships
   - Read the generated theory narrative

5. **Export Results**
   - Click "Export" in the File ribbon
   - Save your project as JSON for backup or sharing

## Technology Stack

- **React 19** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tooling
- **Lucide React** - Beautiful icons
- **D3** - Data visualization
- **Recharts** - Charting
- **IndexedDB (via idb)** - Client-side database
- **Custom NLP algorithms** - Pure JavaScript text analysis

## Architecture

```
src/
├── components/       # React UI components
│   └── WordCloud.tsx
├── services/        # Core business logic
│   ├── nlpService.ts      # NLP algorithms (Open/Axial/Selective Coding)
│   ├── projectService.ts  # Project management
│   └── storageService.ts  # IndexedDB + localStorage
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (stopwords, etc.)
└── App.tsx          # Main application component
```

## NLP Algorithms

All algorithms are implemented in pure JavaScript without external API calls:

- **Tokenization**: Text cleaning and word extraction
- **N-gram Extraction**: Identify meaningful phrases (1-3 words)
- **Stopword Filtering**: Remove common words (Indonesian + English)
- **Co-occurrence Analysis**: Find codes that appear together
- **Clustering**: Group related codes into categories
- **Centrality Calculation**: Identify core categories
- **Theory Generation**: Create narrative from analysis

## Data Privacy

- **100% Local Processing** - No data is sent to external servers
- **No API Calls** - All computation happens in your browser
- **No Tracking** - No analytics or telemetry
- **Offline Capable** - Works without internet connection
- **Your Data Stays Yours** - Complete control over your research data

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- IndexedDB
- LocalStorage
- SVG

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is developed for educational and research purposes at Universitas Jenderal Soedirman.

## Contributing

This application is designed for qualitative researchers performing Grounded Theory analysis. Contributions that enhance the analysis algorithms, improve the UI, or add new features are welcome.

## Credits

Developed for PDIA (Penelitian) at Universitas Jenderal Soedirman.
