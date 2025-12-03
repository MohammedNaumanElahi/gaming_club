import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Container,
  CircularProgress,
  IconButton,
  Slide,
  Fade,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Send as SendIcon, 
  SmartToy as BotIcon, 
  Person as UserIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { chatbotAPI } from "../../services/api";

const GamingBot = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your gaming assistant. Ask me anything about games, strategies, or tips!", 
      sender: "bot", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { 
      id: Date.now(), 
      text, 
      sender: "user", 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Get response from chatbot API
      const response = await chatbotAPI.getTip(text);
      const tip = response.tip || "I'm not sure how to respond to that. Could you try asking something else?";
      
      // Add bot response
      const botMsg = { 
        id: Date.now() + 1, 
        text: tip, 
        sender: "bot", 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot error:", error);
      
      // Add error message
      const errorMsg = { 
        id: Date.now() + 1, 
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.", 
        sender: "bot", 
        timestamp: new Date(),
        isError: true 
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: "calc(100vh - 100px)", 
        display: "flex", 
        flexDirection: "column",
        py: 3
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
        >
          <BotIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">Gaming Assistant</Typography>
        </Box>

        {/* Messages */}
        <Box 
          sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: "auto",
            bgcolor: theme.palette.background.default
          }}
        >
          <List sx={{ width: '100%' }}>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem sx={{ flexDirection: msg.sender === "user" ? "row-reverse" : "row" }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: msg.sender === "bot" ? "primary.main" : "secondary.main" }}>
                      {msg.sender === "bot" ? <BotIcon /> : <UserIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <Box 
                    sx={{ 
                      maxWidth: "70%", 
                      bgcolor: msg.sender === "bot" ? "action.hover" : "primary.main", 
                      color: msg.sender === "bot" ? "text.primary" : "primary.contrastText", 
                      p: 1.5, 
                      borderRadius: 2,
                      position: 'relative',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography sx={{ whiteSpace: 'pre-line' }}>{msg.text}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        textAlign: "right", 
                        opacity: 0.7,
                        mt: 0.5
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            {loading && (
              <ListItem>
                <CircularProgress size={20} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about games..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              inputRef={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              multiline
              maxRows={4}
              size="small"
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    type="submit"
                    disabled={!input.trim() || loading}
                    color="primary"
                    sx={{ 
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                ),
              }}
            />
          </Box>
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 1,
              opacity: 0.7
            }}
          >
            Ask about game strategies, tips, or anything gaming related!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
export default GamingBot;
