import { useState, useEffect, useCallback } from 'react';
import { fetchHealthStatus } from '../services/api';

/**
 * Custom React hook to check backend connectivity and health
 */
export function useHealthCheck() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'online' | 'offline'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const healthData = await fetchHealthStatus();
      setData(healthData);
      setStatus('online');
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    data,
    error,
    refetch: checkStatus,
  };
}

export default useHealthCheck;
