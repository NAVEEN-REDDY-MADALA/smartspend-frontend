// src/pages/DetectedTransactions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/theme.js';

function DetectedTransactions() {
  const navigate = useNavigate();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'https://smartspend-backend-aupt.onrender.com';

  useEffect(() => {
    loadPendingTransactions();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadPendingTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token, redirecting to login...');
        navigate('/login');
        return;
      }

      console.log('📋 Loading pending transactions...');
      
      const response = await fetch(`${API_BASE}/api/detected/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Unauthorized, redirecting to login...');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Pending transactions loaded:', data);
      
      setPendingTransactions(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading pending transactions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAccept = async (smsHash) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`✅ Accepting transaction: ${smsHash}`);
      
      const response = await fetch(`${API_BASE}/api/detected/accept/${smsHash}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to accept: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Transaction accepted:', result);

      // Reload transactions
      await loadPendingTransactions();
      
      alert(`✅ Expense added: ₹${result.amount} at ${result.merchant}`);
    } catch (err) {
      console.error('❌ Error accepting transaction:', err);
      alert('Failed to accept transaction');
    }
  };

  const handleIgnore = async (smsHash) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`❌ Ignoring transaction: ${smsHash}`);
      
      const response = await fetch(`${API_BASE}/api/detected/ignore/${smsHash}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ignore: ${response.status}`);
      }

      console.log('✅ Transaction ignored');

      // Reload transactions
      await loadPendingTransactions();
    } catch (err) {
      console.error('❌ Error ignoring transaction:', err);
      alert('Failed to ignore transaction');
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Food': '🍔',
      'Groceries': '🛒',
      'Travel': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills': '💡',
      'Medicine': '💊',
      'Other': '💰'
    };
    return emojiMap[category] || '💰';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>📱 Detected Transactions</h2>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📱</span>
            Detected Transactions
          </h2>
          <button
            onClick={loadPendingTransactions}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            ❌ Error: {error}
          </div>
        )}

        {pendingTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h3>No pending transactions</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Transactions detected from SMS will appear here for confirmation.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {pendingTransactions.map((txn) => (
              <div
                key={txn.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  padding: '20px',
                  border: '2px solid #667eea',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getCategoryEmoji(txn.category_guess)}
                      ₹{txn.amount}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#666',
                      marginTop: '5px'
                    }}>
                      {txn.merchant}
                    </div>
                  </div>
                  <div style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    PENDING
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '15px',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div>
                    <div style={{ color: '#999', fontSize: '12px' }}>Category</div>
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      {txn.category_guess}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#999', fontSize: '12px' }}>Date</div>
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      {formatDate(txn.transaction_date)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => handleAccept(txn.sms_hash)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleIgnore(txn.sms_hash)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ❌ Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default DetectedTransactions;