const OpenCoding = ({ codes }) => {
  if (!codes || codes.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Open Coding</h2>
        <p style={styles.emptyMessage}>No codes extracted yet. Please input data first.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Open Coding Results</h2>
      <p style={styles.description}>
        Extracted {codes.length} codes using N-gram analysis. These represent recurring patterns in your data.
      </p>
      
      <div style={styles.codesGrid}>
        {codes.slice(0, 50).map((item, index) => (
          <div key={index} style={styles.codeCard}>
            <div style={styles.codeText}>{item.code}</div>
            <div style={styles.frequency}>
              <span style={styles.frequencyBadge}>{item.frequency}</span>
              <span style={styles.frequencyLabel}>occurrences</span>
            </div>
          </div>
        ))}
      </div>

      {codes.length > 50 && (
        <p style={styles.moreInfo}>
          Showing top 50 codes. Total codes extracted: {codes.length}
        </p>
      )}
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
    borderBottom: '2px solid #4CAF50',
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
  codesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
  },
  codeCard: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  codeText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
    wordBreak: 'break-word',
  },
  frequency: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  frequencyBadge: {
    display: 'inline-block',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  frequencyLabel: {
    fontSize: '12px',
    color: '#666',
  },
  moreInfo: {
    marginTop: '20px',
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
};

export default OpenCoding;
