import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Paper,
  Collapse,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Terminal as TerminalIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { NotificationService, LogService } from '../services/api';
import { Log } from '../utils/logger';
import { LogEntry } from '../types';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Console log drawer states
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'All Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Priority Engine', icon: <StarIcon />, path: '/priority' }
  ];

  // Fetch unread count for Badge
  const fetchUnreadCount = async () => {
    try {
      const stats = await NotificationService.getStats();
      setUnreadCount(stats.unread);
    } catch (error) {
      // Slient fail for badges
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const logs = await LogService.fetchRecentLogs(35);
      // Sort to show newest at bottom or top (typically console shows newest at top or scrolls to bottom. Let's show newest at top)
      setSystemLogs(logs.reverse());
    } catch (error) {
      console.error('Failed to load system logs:', error);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  // Lifecycle
  useEffect(() => {
    fetchUnreadCount();

    // Trigger log on page navigation
    Log('frontend', 'info', 'page', `Navigated to page: ${location.pathname}`);

    // Poll stats every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Monitor logs flushed event to update console instantly
  useEffect(() => {
    if (consoleOpen) {
      fetchSystemLogs();
    }

    const handleLogsFlushed = () => {
      if (consoleOpen) {
        fetchSystemLogs();
      }
      fetchUnreadCount(); // Fetch count if read action flushed logs
    };

    window.addEventListener('logs-flushed', handleLogsFlushed);
    return () => window.removeEventListener('logs-flushed', handleLogsFlushed);
  }, [consoleOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    Log('frontend', 'debug', 'component', 'Toggled mobile sidebar drawer');
  };

  const handleConsoleToggle = () => {
    const nextState = !consoleOpen;
    setConsoleOpen(nextState);
    Log('frontend', 'info', 'component', `Toggled system logs console drawer: ${nextState ? 'OPEN' : 'CLOSED'}`);
    if (nextState) {
      fetchSystemLogs();
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case 'debug': return '#0284c7';
      case 'info': return '#10b981';
      case 'warn': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'fatal': return '#ec4899';
      default: return '#64748b';
    }
  };

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, bgcolor: '#1e293b', color: '#fff' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#1a56db',
            borderRadius: 1.5,
            width: 32,
            height: 32
          }}
        >
          <NotificationsIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          NotifHub
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#e2e8f0' }} />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  bgcolor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1a56db' : '#475569',
                  '&:hover': {
                    bgcolor: isActive ? '#eff6ff' : '#f1f5f9',
                    color: isActive ? '#1a56db' : '#0f172a'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#1a56db' : '#64748b',
                    minWidth: 38
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#475569' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h4"
            noWrap
            component="div"
            sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, letterSpacing: '-0.5px' }}
          >
            {location.pathname === '/' && 'System Dashboard'}
            {location.pathname === '/notifications' && 'All Notifications'}
            {location.pathname === '/priority' && 'Priority Queue Engine'}
          </Typography>

          <IconButton color="inherit" onClick={() => navigate('/notifications')} sx={{ color: '#475569' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawers */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation panels"
      >
        {/* Mobile View Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop View Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e2e8f0' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          pb: consoleOpen ? '320px' : '80px', // padding bottom changes depending on console drawer state
          transition: 'padding-bottom 0.2s ease-in-out'
        }}
      >
        {children}
      </Box>

      {/* Live Logging Visualizer Footer Widget */}
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: { xs: 0, md: drawerWidth },
          zIndex: 1201, // Float above content
          borderTop: '1px solid #334155',
          bgcolor: '#0f172a', // Clean terminal dark slate background
          borderRadius: 0,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Toolbar
          onClick={handleConsoleToggle}
          sx={{
            minHeight: '44px !important',
            cursor: 'pointer',
            justifyContent: 'space-between',
            px: 2,
            bgcolor: '#1e293b', // Header bar color
            color: '#94a3b8',
            '&:hover': {
              bgcolor: '#334155',
              color: '#f8fafc'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
              System Logs Console
            </Typography>
            <Chip
              label="Live Aggregator"
              size="small"
              sx={{
                bgcolor: '#0f172a',
                color: '#10b981',
                height: 18,
                fontSize: '0.6875rem',
                fontWeight: 600,
                border: '1px solid #10b981'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {consoleOpen && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchSystemLogs();
                }}
                disabled={isRefreshingLogs}
                sx={{ color: '#94a3b8' }}
              >
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {consoleOpen ? <ArrowDownIcon sx={{ fontSize: 18 }} /> : <ArrowUpIcon sx={{ fontSize: 18 }} />}
          </Box>
        </Toolbar>

        <Collapse in={consoleOpen} timeout="auto">
          <Box
            sx={{
              height: 220,
              overflowY: 'auto',
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            {systemLogs.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', m: 'auto' }}>
                Console initialized. Perform actions in the dashboard to trigger telemetry logs...
              </Typography>
            ) : (
              systemLogs.map((log, index) => {
                const color = getLogBadgeColor(log.level);
                return (
                  <Box
                    key={`${log.timestamp}-${index}`}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5,
                      borderBottom: '1px solid #1e293b',
                      pb: 0.5,
                      alignItems: 'center'
                    }}
                  >
                    <Box component="span" sx={{ color: '#64748b' }}>
                      [{log.timestamp.substring(11, 19)}]
                    </Box>
                    <Box component="span" sx={{ color: log.stack === 'backend' ? '#a78bfa' : '#60a5fa', fontWeight: 'bold' }}>
                      [{log.stack.toUpperCase()}]
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        color,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        minWidth: 50
                      }}
                    >
                      {log.level}
                    </Box>
                    <Box component="span" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      [{log.packageName}]
                    </Box>
                    <Box component="span" sx={{ color: '#f8fafc', ml: 0.5 }}>
                      {log.message}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
