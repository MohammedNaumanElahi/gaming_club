axios.get('http://localhost:5000/api/games', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
