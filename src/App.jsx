import { useState, useEffect } from 'react';
import DataInput from './components/DataInput';
import OpenCoding from './components/OpenCoding';
import AxialCoding from './components/AxialCoding';
import SelectiveCoding from './components/SelectiveCoding';
import WordCloudVisualization from './components/WordCloudVisualization';
import Visualizations from './components/Visualizations';
import { extractCodes, clusterCodes, identifyCoreCategories, calculateWordFrequency } from './utils/algorithms';
import { saveAnalysis, getAllAnalyses, deleteAnalysis } from './utils/database';
import './App.css';

function App() {
  const [currentText, setCurrentText] = useState('');
  const [codes, setCodes] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [selectiveResult, setSelectiveResult] = useState(null);
  const [wordFrequencies, setWordFrequencies] = useState([]);
  const [activeTab, setActiveTab] = useState('input');
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [analysisName, setAnalysisName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = async () => {
    try {
      const analyses = await getAllAnalyses();
      setSavedAnalyses(analyses || []);
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const handleDataLoaded = async (data) => {
    setProcessing(true);
    const text = data.text;
    setCurrentText(text);

    try {
      // Open Coding
      const extractedCodes = extractCodes(text, 1, 3, 2);
      setCodes(extractedCodes);

      // Axial Coding
      const codeClusters = clusterCodes(text, extractedCodes, 50);
      setClusters(codeClusters);

      // Selective Coding
      const coreResult = identifyCoreCategories(codeClusters, text, 5);
      setSelectiveResult(coreResult);

      // Word Cloud
      const frequencies = calculateWordFrequency(text, 3, 50);
      setWordFrequencies(frequencies);

      setActiveTab('openCoding');
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error during analysis: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisName.trim()) {
      alert('Please enter a name for this analysis');
      return;
    }

    try {
      const analysis = {
        name: analysisName,
        text: currentText,
        codes,
        clusters,
        selectiveResult,
        wordFrequencies,
      };
      await saveAnalysis(analysis);
      setAnalysisName('');
      await loadSavedAnalyses();
      alert('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis: ' + error.message);
    }
  };

  const handleLoadAnalysis = (analysis) => {
    setCurrentText(analysis.text);
    setCodes(analysis.codes || []);
    setClusters(analysis.clusters || []);
    setSelectiveResult(analysis.selectiveResult || null);
    setWordFrequencies(analysis.wordFrequencies || []);
    setActiveTab('openCoding');
  };

  const handleDeleteAnalysis = async (id) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteAnalysis(id);
        await loadSavedAnalyses();
      } catch (error) {
        console.error('Error deleting analysis:', error);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'input':
        return <DataInput onDataLoaded={handleDataLoaded} />;
      case 'openCoding':
        return <OpenCoding codes={codes} />;
      case 'axialCoding':
        return <AxialCoding clusters={clusters} />;
      case 'selectiveCoding':
        return <SelectiveCoding result={selectiveResult} />;
      case 'wordCloud':
        return <WordCloudVisualization words={wordFrequencies} />;
      case 'visualizations':
        return <Visualizations codes={codes} clusters={clusters} coreCategories={selectiveResult?.coreCategories} />;
      case 'saved':
        return (
          <div style={styles.savedContainer}>
            <h2>Saved Analyses</h2>
            {savedAnalyses.length === 0 ? (
              <p style={styles.emptyMessage}>No saved analyses yet.</p>
            ) : (
              <div style={styles.analysesList}>
                {savedAnalyses.map((analysis) => (
                  <div key={analysis.id} style={styles.analysisCard}>
                    <div style={styles.analysisHeader}>
                      <h3 style={styles.analysisName}>{analysis.name}</h3>
                      <span style={styles.analysisDate}>
                        {new Date(analysis.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p style={styles.analysisPreview}>
                      {analysis.text?.substring(0, 100)}...
                    </p>
                    <div style={styles.analysisActions}>
                      <button style={styles.loadButton} onClick={() => handleLoadAnalysis(analysis)}>
                        Load
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDeleteAnalysis(analysis.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <DataInput onDataLoaded={handleDataLoaded} />;
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Arian - Grounded Theory Analysis</h1>
        <p style={styles.subtitle}>
          Analisis Tekstual Riset Axial Naratif - Offline-capable React 19 Application
        </p>
      </header>

      <nav style={styles.nav}>
        <button
          style={activeTab === 'input' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('input')}
        >
          📝 Input Data
        </button>
        <button
          style={activeTab === 'openCoding' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('openCoding')}
          disabled={codes.length === 0}
        >
          🔍 Open Coding
        </button>
        <button
          style={activeTab === 'axialCoding' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('axialCoding')}
          disabled={clusters.length === 0}
        >
          🔗 Axial Coding
        </button>
        <button
          style={activeTab === 'selectiveCoding' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('selectiveCoding')}
          disabled={!selectiveResult}
        >
          ⭐ Selective Coding
        </button>
        <button
          style={activeTab === 'wordCloud' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('wordCloud')}
          disabled={wordFrequencies.length === 0}
        >
          ☁️ Word Cloud
        </button>
        <button
          style={activeTab === 'visualizations' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('visualizations')}
          disabled={codes.length === 0}
        >
          📊 Visualizations
        </button>
        <button
          style={activeTab === 'saved' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved
        </button>
      </nav>

      {processing && (
        <div style={styles.processingBanner}>
          Processing analysis, please wait...
        </div>
      )}

      {codes.length > 0 && activeTab !== 'saved' && activeTab !== 'input' && (
        <div style={styles.saveSection}>
          <input
            type="text"
            placeholder="Enter analysis name to save..."
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            style={styles.saveInput}
          />
          <button style={styles.saveButton} onClick={handleSaveAnalysis}>
            💾 Save Analysis
          </button>
        </div>
      )}

      <main style={styles.main}>
        {renderTabContent()}
      </main>

      <footer style={styles.footer}>
        <p>
          Built with React 19 | Offline-capable with IndexedDB | 
          N-gram Analysis | Co-occurrence Clustering | Theory Generation
        </p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#1976D2',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mainTitle: {
    margin: '0 0 10px 0',
    fontSize: '36px',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    opacity: 0.9,
  },
  nav: {
    backgroundColor: 'white',
    padding: '10px',
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navButton: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  activeNavButton: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#1976D2',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  processingBanner: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    padding: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveSection: {
    backgroundColor: 'white',
    padding: '15px 20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  saveInput: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '300px',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    marginTop: 'auto',
  },
  savedContainer: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyMessage: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '40px',
  },
  analysesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  analysisCard: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  analysisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  analysisName: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  analysisDate: {
    fontSize: '12px',
    color: '#666',
  },
  analysisPreview: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
  },
  analysisActions: {
    display: 'flex',
    gap: '10px',
  },
  loadButton: {
    flex: 1,
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default App;
