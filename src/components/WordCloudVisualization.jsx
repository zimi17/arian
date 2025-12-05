import WordCloud from 'react-d3-cloud';

const WordCloudVisualization = ({ words }) => {
  if (!words || words.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Word Cloud</h2>
        <p style={styles.emptyMessage}>No data available for word cloud.</p>
      </div>
    );
  }

  const fontSizeMapper = word => Math.log2(word.value) * 15;
  const rotate = () => 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Word Cloud Visualization</h2>
      <p style={styles.description}>
        Visual representation of the most frequent words in your data.
      </p>
      
      <div style={styles.cloudContainer}>
        <WordCloud
          data={words}
          width={800}
          height={400}
          font="Arial"
          fontSizeMapper={fontSizeMapper}
          rotate={rotate}
          padding={2}
          random={Math.random}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    marginTop: 0,
    color: '#333',
    borderBottom: '2px solid #9C27B0',
    paddingBottom: '10px',
  },
  description: {
    color: '#666',
    marginBottom: '20px',
  },
  emptyMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
  cloudContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '400px',
  },
};

export default WordCloudVisualization;
