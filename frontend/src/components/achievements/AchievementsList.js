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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { achievementsAPI, gamesAPI } from '../../services/api';

const AchievementsList = () => {
  const [achievements, setAchievements] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [selectedGame, setSelectedGame] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    dateAchieved: new Date().toISOString().split('T')[0]
  });

  // Fetch games and achievements on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Fetch achievements when selected game changes
  useEffect(() => {
    if (selectedGame) {
      fetchAchievements(selectedGame);
    } else {
      setAchievements([]);
      setLoading(false);
    }
  }, [selectedGame]);

  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      const response = await gamesAPI.getGames();
      setGames(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch games. Please try again.');
      console.error('Error fetching games:', err);
    } finally {
      setGamesLoading(false);
    }
  };

  const fetchAchievements = async (gameId) => {
    try {
      setLoading(true);
      const response = await achievementsAPI.getAchievements(gameId);
      setAchievements(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch achievements. Please try again.');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedGame || !searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const response = await achievementsAPI.searchAchievements(selectedGame, searchTerm);
      setAchievements(response.data);
    } catch (err) {
      setError('Failed to search achievements. Please try again.');
      console.error('Error searching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (achievement = null) => {
    if (achievement) {
      setCurrentAchievement(achievement._id);
      setFormData({
        title: achievement.title,
        description: achievement.description || '',
        game: achievement.game._id,
        dateAchieved: achievement.dateAchieved.split('T')[0]
      });
    } else {
      setCurrentAchievement(null);
      setFormData({
        title: '',
        description: '',
        game: selectedGame || '',
        dateAchieved: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAchievement(null);
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
      
      if (currentAchievement) {
        // Update existing achievement
        await achievementsAPI.updateAchievement(currentAchievement, formData);
      } else {
        // Create new achievement
        await achievementsAPI.createAchievement(formData);
      }
      
      // Refresh the achievements list
      if (selectedGame) {
        await fetchAchievements(selectedGame);
      }
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error saving achievement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      try {
        setLoading(true);
        await achievementsAPI.deleteAchievement(id);
        if (selectedGame) {
          await fetchAchievements(selectedGame);
        }
      } catch (err) {
        setError('Failed to delete achievement. Please try again.');
        console.error('Error deleting achievement:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Achievements
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="game-select-label">Select Game</InputLabel>
            <Select
              labelId="game-select-label"
              id="game-select"
              value={selectedGame}
              label="Select Game"
              onChange={(e) => setSelectedGame(e.target.value)}
              disabled={gamesLoading || loading}
            >
              <MenuItem value="">
                <em>Select a game</em>
              </MenuItem>
              {games.map((game) => (
                <MenuItem key={game._id} value={game._id}>
                  {game.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedGame && (
            <>
              <TextField
                label="Search achievements"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={loading || !selectedGame}
              >
                Add Achievement
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {!selectedGame ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {gamesLoading ? 'Loading games...' : 'Select a game to view or add achievements'}
          </Typography>
        </Paper>
      ) : loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2}>
          <List>
            {achievements.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No achievements found." 
                  secondary={searchTerm ? 'Try a different search term.' : 'Add your first achievement to get started!'} 
                />
              </ListItem>
            ) : (
              achievements.map((achievement) => (
                <React.Fragment key={achievement._id}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{achievement.title}</Typography>
                          {achievement.dateAchieved && (
                            <Chip 
                              label={formatDate(achievement.dateAchieved)} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {achievement.description || 'No description provided'}
                        </Typography>
                      } 
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpenDialog(achievement)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(achievement._id)}
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

      {/* Add/Edit Achievement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{currentAchievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="dateAchieved"
              label="Date Achieved"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.dateAchieved}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <input type="hidden" name="game" value={formData.game} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : currentAchievement ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AchievementsList;
