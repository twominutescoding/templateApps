import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoWhite from '../assets/images/logo-white.svg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          mx: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            py: 4,
            px: 4,
            textAlign: 'center',
            color: 'white',
          }}
        >
          {/* Company Logo */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={logoWhite}
              alt="Company Logo"
              style={{
                height: '50px',
                maxWidth: '200px',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Sign in to access your dashboard
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Collapse in={!!error}>
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setError('')}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Collapse>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#2a5298' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2a5298',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2a5298',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#2a5298',
                  },
                  // Override Chrome autofill
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 50px rgba(255, 255, 255, 0) inset !important',
                    backgroundColor: 'transparent !important',
                    backgroundClip: 'text',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#1e3c72' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1e3c72',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1e3c72',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1e3c72',
                  },
                  // Override Chrome autofill
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 50px rgba(255, 255, 255, 0) inset !important',
                    backgroundColor: 'transparent !important',
                    backgroundClip: 'text',
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  mt: 1,
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  boxShadow: '0 4px 15px rgba(30, 60, 114, 0.4)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a3461 0%, #245085 100%)',
                    boxShadow: '0 6px 20px rgba(30, 60, 114, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              fontSize: '0.75rem',
            }}
          >
            Secured with JWT Authentication
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
