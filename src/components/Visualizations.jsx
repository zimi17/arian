import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Visualizations = ({ codes, clusters, coreCategories }) => {
  const hasData = codes?.length > 0 || clusters?.length > 0 || coreCategories?.length > 0;

  if (!hasData) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Data Visualizations</h2>
        <p style={styles.emptyMessage}>No data available for visualization yet.</p>
      </div>
    );
  }

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];

  // Prepare code frequency data (top 10)
  const codeData = codes?.slice(0, 10).map(item => ({
    name: item.code.length > 20 ? item.code.substring(0, 20) + '...' : item.code,
    frequency: item.frequency
  })) || [];

  // Prepare cluster data
  const clusterData = clusters?.map((cluster) => ({
    name: cluster.category.length > 20 ? cluster.category.substring(0, 20) + '...' : cluster.category,
    strength: cluster.strength,
    codes: cluster.codes.length
  })) || [];

  // Prepare core category scores
  const categoryScoreData = coreCategories?.map(cat => ({
    name: cat.category.length > 20 ? cat.category.substring(0, 20) + '...' : cat.category,
    score: parseFloat(cat.score)
  })) || [];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Data Visualizations</h2>
      
      {codeData.length > 0 && (
        <div style={styles.chartSection}>
          <h3 style={styles.chartTitle}>Top 10 Most Frequent Codes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={codeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="frequency" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {clusterData.length > 0 && (
        <div style={styles.chartSection}>
          <h3 style={styles.chartTitle}>Cluster Strengths</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clusterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="strength" fill="#2196F3" name="Connection Strength" />
              <Bar dataKey="codes" fill="#FF9800" name="Number of Codes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoryScoreData.length > 0 && (
        <div style={styles.chartSection}>
          <h3 style={styles.chartTitle}>Core Category Scores</h3>
          <div style={styles.chartsRow}>
            <div style={styles.halfChart}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#FF9800" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.halfChart}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryScoreData}
                    dataKey="score"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryScoreData.map((entry, _index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[_index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
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
    borderBottom: '2px solid #673AB7',
    paddingBottom: '10px',
  },
  emptyMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
  chartSection: {
    marginBottom: '40px',
  },
  chartTitle: {
    color: '#555',
    marginBottom: '20px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  halfChart: {
    minHeight: '300px',
  },
};

export default Visualizations;
