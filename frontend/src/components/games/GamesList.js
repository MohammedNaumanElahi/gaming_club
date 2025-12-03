import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { gamesAPI } from '../../services/api';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    platform: ''
  });

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getGames();
      setGames(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch games. Please try again.');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (game = null) => {
    if (game) {
      setCurrentGame(game._id);
      setFormData({
        name: game.name,
        genre: game.genre || '',
        platform: game.platform || ''
      });
    } else {
      setCurrentGame(null);
      setFormData({
        name: '',
        genre: '',
        platform: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGame(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (currentGame) {
        // Update existing game
        await gamesAPI.updateGame(currentGame, formData);
      } else {
        // Create new game
        await gamesAPI.createGame(formData);
      }
      
      // Refresh the games list
      await fetchGames();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error saving game:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      try {
        setLoading(true);
        await gamesAPI.deleteGame(id);
        await fetchGames();
      } catch (err) {
        setError('Failed to delete game. Please try again.');
        console.error('Error deleting game:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Games
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Game
        </Button>
      </Box>

      {error && (
        <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {loading && games.length === 0 ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2}>
          <List>
            {games.length === 0 ? (
              <ListItem>
                <ListItemText primary="No games found. Add your first game to get started!" />
              </ListItem>
            ) : (
              games.map((game) => (
                <React.Fragment key={game._id}>
                  <ListItem>
                    <ListItemText 
                      primary={game.name} 
                      secondary={
                        <>
                          {game.genre && <span>{game.genre} • </span>}
                          {game.platform || 'Platform not specified'}
                        </>
                      } 
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpenDialog(game)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(game._id)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      {/* Add/Edit Game Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{currentGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Game Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="genre"
              label="Genre"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.genre}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="platform"
              label="Platform"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.platform}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : currentGame ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default GamesList;
