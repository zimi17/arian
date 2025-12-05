# Arian - Grounded Theory Analysis

**Analisis Tekstual Riset Axial Naratif** - A comprehensive Grounded Theory analysis application built with React 19, featuring advanced algorithms for qualitative data analysis, word clouds, and comprehensive visualizations - all completely offline-capable with IndexedDB storage.

## Features

### Data Input
- **Text Input**: Direct text entry for quick analysis
- **JSON Input**: Support for structured JSON data with automatic text extraction
- **CSV Input**: Parse CSV files and analyze tabular data
- **File Upload**: Upload `.txt`, `.json`, or `.csv` files

### Three-Stage Coding Analysis

#### 1. Open Coding
- Automatic extraction of codes using N-gram analysis (1-3 grams)
- Frequency-based filtering to identify significant patterns
- Visual display of top codes with occurrence counts

#### 2. Axial Coding
- Clustering codes into categories based on co-occurrence patterns
- Sliding window analysis to detect code relationships
- Strength metrics for each cluster showing interconnection levels

#### 3. Selective Coding
- Identification of core categories using multi-factor scoring:
  - **Coverage**: How much of the text relates to each category
  - **Centrality**: Connection strength to other categories
  - **Diversity**: Variety of codes within each category
- Automatic theory generation based on core categories
- Ranked categories with comprehensive metrics

### Visualizations

- **Word Cloud**: Interactive visual representation of word frequencies
- **Bar Charts**: Code frequencies, cluster strengths, and category scores
- **Pie Charts**: Distribution of core category importance
- **Multi-metric Displays**: Combined visualizations for comprehensive insights

### Offline Storage

- **IndexedDB Integration**: All analyses are saved locally in the browser
- **Persistent Storage**: Access your analyses even without internet
- **Save/Load System**: Name and manage multiple analysis sessions
- **Export-Ready**: All data stored in structured format

## Technology Stack

- **React 19**: Latest React version with modern hooks and features
- **Vite**: Fast build tool and development server
- **IndexedDB (via idb)**: Offline-capable database storage
- **PapaParse**: CSV parsing library
- **Recharts**: Powerful charting library for data visualization
- **react-d3-cloud**: Word cloud visualization component
- **D3.js**: Data visualization library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

1. **Input Your Data**
   - Choose your preferred input method (Text, JSON, CSV, or File Upload)
   - Enter or upload your qualitative research data
   - Click "Analyze" to begin processing

2. **Review Open Coding Results**
   - Examine extracted codes and their frequencies
   - Top 50 most significant codes are displayed
   - Codes represent recurring patterns in your data

3. **Explore Axial Coding**
   - View categories formed from clustered codes
   - Understand relationships between different concepts
   - Analyze strength metrics to identify key connections

4. **Examine Selective Coding**
   - Read the generated theory statement
   - Review core categories with detailed metrics
   - Understand the central phenomena in your research

5. **Visualize Your Data**
   - Explore word clouds to see prominent terms
   - Compare frequencies and distributions with charts
   - Gain visual insights into your analysis

6. **Save Your Work**
   - Name your analysis and save it locally
   - Load previous analyses anytime
   - All data remains available offline

## Algorithms

### N-gram Analysis
Extracts meaningful phrases (1-3 words) from text, filtering by minimum frequency to identify significant patterns.

### Co-occurrence Clustering
Uses sliding window analysis to identify codes that appear together, clustering related concepts into categories.

### Multi-factor Scoring
Ranks categories based on:
- Coverage (0.5 weight): Relevance to the entire dataset
- Centrality (0.3 weight): Connection strength to other categories
- Diversity (0.2 weight): Variety of constituent codes

## Project Structure

```
src/
├── components/
│   ├── DataInput.jsx           # Data input interface
│   ├── OpenCoding.jsx          # Open coding results display
│   ├── AxialCoding.jsx         # Axial coding results display
│   ├── SelectiveCoding.jsx     # Selective coding results display
│   ├── WordCloudVisualization.jsx  # Word cloud component
│   └── Visualizations.jsx      # Charts and graphs
├── utils/
│   ├── algorithms.js           # Core analysis algorithms
│   └── database.js             # IndexedDB operations
├── App.jsx                     # Main application component
├── main.jsx                    # Application entry point
└── index.css                   # Global styles
```

## Contributing

This is an open-source educational project. Contributions are welcome!

## License

MIT

## About

Arian (Analisis Tekstual Riset Axial Naratif) is designed to make Grounded Theory analysis accessible and efficient for qualitative researchers. It implements established methodologies in an intuitive, offline-capable web application.

