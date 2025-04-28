import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SearchComponent = () => {
  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Filter state
  const [filters, setFilters] = useState({
    difficulty: '',
    instructor: '',
    sort: '_score'
  });

  const handleSearch = useCallback(async (page = 1) => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams({
        q: query,
        page,
        size: pagination.size,
        sort: filters.sort,
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.instructor && { instructor: filters.instructor })
      });

      const { data } = await axios.get(`/api/search?${params}`);
      
      setResults(data.results || []);
      setPagination({
        page: data.meta.page,
        size: data.meta.size,
        total: data.meta.total_results
      });
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, pagination.size, filters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Styles (same as before)
  const styles = {
    container: {
      maxWidth: '1200px', // Wider for filters
      margin: '2rem auto',
      padding: '0 1rem',
      fontFamily: 'sans-serif'
    },
    searchBox: {
      position: 'relative',
      marginBottom: '1.5rem'
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    filterLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#475569'
    },
    filterSelect: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white'
    },
    // ... (keep all your existing styles)
  };

  return (
    <div style={styles.container}>
      {/* Search Input (unchanged) */}
      <div style={styles.searchBox}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          style={{
            ...styles.input,
            ...(isFocused ? styles.inputFocus : {})
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {loading && <div style={styles.spinner} />}
      </div>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Difficulty:</label>
          <select
            style={styles.filterSelect}
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort by:</label>
          <select
            style={styles.filterSelect}
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="_score">Relevance</option>
            <option value="rating">Rating</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        {/* Instructor filter would be populated from aggregations */}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Results */}
      <div style={styles.results}>
        {loading && results.length === 0 ? (
          <div style={styles.emptyState}>Searching...</div>
        ) : results.length > 0 ? (
          results.map((course) => (
            <div 
              key={course._id} 
              style={{
                ...styles.card,
                ...(isFocused ? {} : styles.cardHover)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.cardHover.transform;
                e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = styles.card.boxShadow;
              }}
            >
              <h3 style={styles.title}>
                {course.courseName}
                {course.highlights?.courseName && (
                  <span dangerouslySetInnerHTML={{ 
                    __html: course.highlights.courseName[0] 
                  }} />
                )}
              </h3>
              <p style={styles.description}>
                {course.highlights?.description ? (
                  <span dangerouslySetInnerHTML={{ 
                    __html: course.highlights.description[0] 
                  }} />
                ) : (
                  course.description
                )}
              </p>
              <div style={styles.meta}>
                <span>By {course.instructor}</span>
                <span>{course.duration || 'No duration specified'}</span>
              </div>
            </div>
          ))
        ) : query && !loading ? (
          <div style={styles.emptyState}>
            No courses found matching &quot;{query.replace(/</g, '&lt;')}&quot;
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: pagination.page > 1 ? '#4f46e5' : '#e2e8f0',
              color: pagination.page > 1 ? 'white' : '#64748b',
              cursor: pagination.page > 1 ? 'pointer' : 'not-allowed'
            }}
            disabled={pagination.page <= 1}
            onClick={() => handleSearch(pagination.page - 1)}
          >
            Previous
          </button>
          
          <span style={{
            padding: '0.5rem 1rem',
            color: '#475569'
          }}>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
          </span>
          
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: pagination.page * pagination.size < pagination.total 
                ? '#4f46e5' : '#e2e8f0',
              color: pagination.page * pagination.size < pagination.total 
                ? 'white' : '#64748b',
              cursor: pagination.page * pagination.size < pagination.total 
                ? 'pointer' : 'not-allowed'
            }}
            disabled={pagination.page * pagination.size >= pagination.total}
            onClick={() => handleSearch(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchComponent;