const AxialCoding = ({ clusters }) => {
  if (!clusters || clusters.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Axial Coding</h2>
        <p style={styles.emptyMessage}>No clusters identified yet. Please complete open coding first.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Axial Coding Results</h2>
      <p style={styles.description}>
        Identified {clusters.length} categories by clustering codes based on their co-occurrence patterns.
      </p>
      
      <div style={styles.clustersContainer}>
        {clusters.map((cluster, index) => (
          <div key={index} style={styles.clusterCard}>
            <div style={styles.clusterHeader}>
              <h3 style={styles.categoryName}>
                Category {index + 1}: {cluster.category}
              </h3>
              <div style={styles.strengthBadge}>
                Strength: {cluster.strength}
              </div>
            </div>
            
            <div style={styles.codesContainer}>
              <strong style={styles.codesLabel}>Related Codes:</strong>
              <div style={styles.codesList}>
                {cluster.codes.map((code, codeIndex) => (
                  <span key={codeIndex} style={styles.codeTag}>
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
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
    borderBottom: '2px solid #2196F3',
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
  clustersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  clusterCard: {
    padding: '20px',
    backgroundColor: '#f5f9ff',
    borderRadius: '8px',
    border: '1px solid #d0e4ff',
  },
  clusterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  categoryName: {
    margin: 0,
    color: '#1976D2',
    fontSize: '18px',
  },
  strengthBadge: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  codesContainer: {
    marginTop: '10px',
  },
  codesLabel: {
    color: '#555',
    marginBottom: '8px',
    display: 'block',
  },
  codesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  codeTag: {
    display: 'inline-block',
    backgroundColor: 'white',
    color: '#1976D2',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    border: '1px solid #d0e4ff',
  },
};

export default AxialCoding;
