import { useState } from 'react';
import Papa from 'papaparse';

const DataInput = ({ onDataLoaded }) => {
  const [inputMethod, setInputMethod] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onDataLoaded({ text: textInput, type: 'text' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;

      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          // If JSON is an array of objects with text fields, concatenate them
          if (Array.isArray(json)) {
            const text = json
              .map(item => typeof item === 'string' ? item : item.text || JSON.stringify(item))
              .join('\n\n');
            onDataLoaded({ text, type: 'json', raw: json });
          } else if (json.text) {
            onDataLoaded({ text: json.text, type: 'json', raw: json });
          } else {
            onDataLoaded({ text: JSON.stringify(json, null, 2), type: 'json', raw: json });
          }
        } catch (error) {
          alert('Invalid JSON file: ' + error.message);
        }
      } else if (file.name.endsWith('.csv')) {
        Papa.parse(content, {
          header: true,
          complete: (results) => {
            // Concatenate all text fields
            const text = results.data
              .map(row => Object.values(row).join(' '))
              .join('\n');
            onDataLoaded({ text, type: 'csv', raw: results.data });
          },
          error: (error) => {
            alert('CSV parsing error: ' + error.message);
          }
        });
      } else {
        // Treat as plain text
        onDataLoaded({ text: content, type: 'text' });
      }
      
      setLoading(false);
    };

    reader.onerror = () => {
      alert('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleJsonInput = (jsonText) => {
    try {
      const json = JSON.parse(jsonText);
      if (Array.isArray(json)) {
        const text = json
          .map(item => typeof item === 'string' ? item : item.text || JSON.stringify(item))
          .join('\n\n');
        onDataLoaded({ text, type: 'json', raw: json });
      } else if (json.text) {
        onDataLoaded({ text: json.text, type: 'json', raw: json });
      } else {
        onDataLoaded({ text: JSON.stringify(json, null, 2), type: 'json', raw: json });
      }
    } catch (error) {
      alert('Invalid JSON: ' + error.message);
    }
  };

  const handleCsvInput = (csvText) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const text = results.data
          .map(row => Object.values(row).join(' '))
          .join('\n');
        onDataLoaded({ text, type: 'csv', raw: results.data });
      },
      error: (error) => {
        alert('CSV parsing error: ' + error.message);
      }
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Data Input</h2>
      
      <div style={styles.methodSelector}>
        <button
          style={inputMethod === 'text' ? styles.activeButton : styles.button}
          onClick={() => setInputMethod('text')}
        >
          Text Input
        </button>
        <button
          style={inputMethod === 'json' ? styles.activeButton : styles.button}
          onClick={() => setInputMethod('json')}
        >
          JSON Input
        </button>
        <button
          style={inputMethod === 'csv' ? styles.activeButton : styles.button}
          onClick={() => setInputMethod('csv')}
        >
          CSV Input
        </button>
        <button
          style={inputMethod === 'file' ? styles.activeButton : styles.button}
          onClick={() => setInputMethod('file')}
        >
          File Upload
        </button>
      </div>

      {inputMethod === 'text' && (
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder="Enter your text data here for analysis..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
          />
          <button style={styles.submitButton} onClick={handleTextSubmit}>
            Analyze Text
          </button>
        </div>
      )}

      {inputMethod === 'json' && (
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder='Enter JSON data (e.g., {"text": "your data"} or [{"text": "item1"}, ...])'
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
          />
          <button style={styles.submitButton} onClick={() => handleJsonInput(textInput)}>
            Parse and Analyze JSON
          </button>
        </div>
      )}

      {inputMethod === 'csv' && (
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder="Enter CSV data with headers..."
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
          />
          <button style={styles.submitButton} onClick={() => handleCsvInput(textInput)}>
            Parse and Analyze CSV
          </button>
        </div>
      )}

      {inputMethod === 'file' && (
        <div style={styles.inputArea}>
          <input
            type="file"
            accept=".txt,.json,.csv"
            onChange={handleFileUpload}
            style={styles.fileInput}
          />
          {loading && <p>Loading file...</p>}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    marginTop: 0,
    color: '#333',
  },
  methodSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  activeButton: {
    padding: '10px 20px',
    border: '1px solid #4CAF50',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  fileInput: {
    padding: '10px',
    border: '2px dashed #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
};

export default DataInput;
