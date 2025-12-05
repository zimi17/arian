const SelectiveCoding = ({ result }) => {
  if (!result || !result.coreCategories || result.coreCategories.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Selective Coding</h2>
        <p style={styles.emptyMessage}>No core categories identified yet. Please complete axial coding first.</p>
      </div>
    );
  }

  const { coreCategories, theory } = result;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Selective Coding Results</h2>
      <p style={styles.description}>
        Identified {coreCategories.length} core categories that represent the central phenomena in your data.
      </p>

      <div style={styles.theorySection}>
        <h3 style={styles.theoryTitle}>Generated Theory</h3>
        <div style={styles.theoryBox}>
          {theory}
        </div>
      </div>

      <div style={styles.categoriesSection}>
        <h3 style={styles.sectionTitle}>Core Categories</h3>
        {coreCategories.map((category, index) => (
          <div key={index} style={styles.categoryCard}>
            <div style={styles.categoryHeader}>
              <div style={styles.rankBadge}>#{category.rank}</div>
              <h4 style={styles.categoryName}>{category.category}</h4>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Coverage:</span>
                <span style={styles.metricValue}>{category.coverage}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Centrality:</span>
                <span style={styles.metricValue}>{category.centrality}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Diversity:</span>
                <span style={styles.metricValue}>{category.diversity}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Score:</span>
                <span style={styles.metricValue}>{category.score}</span>
              </div>
            </div>

            <div style={styles.codesSection}>
              <strong style={styles.codesLabel}>Related Codes:</strong>
              <div style={styles.codesList}>
                {category.codes.map((code, codeIndex) => (
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
    borderBottom: '2px solid #FF9800',
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
  theorySection: {
    marginBottom: '30px',
  },
  theoryTitle: {
    color: '#FF9800',
    marginBottom: '10px',
  },
  theoryBox: {
    padding: '20px',
    backgroundColor: '#fff3e0',
    borderRadius: '8px',
    border: '2px solid #FFB74D',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
  },
  categoriesSection: {
    marginTop: '30px',
  },
  sectionTitle: {
    color: '#FF9800',
    marginBottom: '15px',
  },
  categoryCard: {
    padding: '20px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '15px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  rankBadge: {
    backgroundColor: '#FF9800',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  categoryName: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FF9800',
  },
  codesSection: {
    marginTop: '15px',
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
    color: '#F57C00',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    border: '1px solid #FFE0B2',
  },
};

export default SelectiveCoding;
