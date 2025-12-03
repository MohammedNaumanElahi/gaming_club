import React, { useState } from 'react';
import axios from 'axios';

const GamingBot = () => {
  const [question, setQuestion] = useState('');
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);

  const getTip = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setTip(''); // reset previous tip

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chatbot',
        { question },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Use "answer" because backend now returns { answer: "..." }
      setTip(res.data.answer || 'No tip available.');
    } catch (err) {
      console.error(err);
      setTip('Error fetching tip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', padding: 20 }}>
      <h2>🎮 Gaming Bot</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about gaming..."
        rows={4}
        style={{ width: '100%', marginBottom: 10, padding: 10 }}
      />
      <button onClick={getTip} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Thinking...' : 'Get Gaming Tip'}
      </button>
      {tip && (
        <p style={{ marginTop: 20, padding: 10, backgroundColor: '#eef', borderRadius: 5 }}>
          {tip}
        </p>
      )}
    </div>
  );
};

export default GamingBot;
