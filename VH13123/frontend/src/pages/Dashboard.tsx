import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Notifications as BellIcon,
  Work as PlacementIcon,
  Assessment as ResultIcon,
  Event as EventIcon,
  MarkChatRead as ReadIcon,
  MarkChatUnread as UnreadIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { NotificationService } from '../services/api';
import { Log } from '../utils/logger';
import { Notification, NotificationStats } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async (isManualRefresh = false) => {
    setLoading(true);
    setError(null);
    if (isManualRefresh) {
      Log('frontend', 'info', 'page', 'User triggered manual dashboard reload');
    } else {
      Log('frontend', 'debug', 'page', 'Dashboard page loading telemetry initiated');
    }

    try {
      const statsData = await NotificationService.getStats();
      const listData = await NotificationService.getNotifications({ page: 1, limit: 5 });

      setStats(statsData);
      setRecent(listData.notifications);
      Log('frontend', 'info', 'page', 'Successfully loaded dashboard metrics and recent notification lists');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to fetch dashboard data';
      setError(errMsg);
      Log('frontend', 'error', 'page', `Dashboard load failure: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleRead = async (id: string, currentlyRead: boolean) => {
    try {
      Log('frontend', 'info', 'page', `Toggling read state for notification ${id} to ${!currentlyRead}`);
      if (currentlyRead) {
        await NotificationService.markAsUnread(id);
      } else {
        await NotificationService.markAsRead(id);
      }
      
      // Update UI lists locally to make interface snappy
      setRecent((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: !currentlyRead } : n))
      );
      
      // Update stats counts
      if (stats) {
        setStats({
          ...stats,
          unread: currentlyRead ? stats.unread + 1 : stats.unread - 1
        });
      }
    } catch (err: any) {
      Log('frontend', 'error', 'page', `Failed to toggle read state for notification ${id}: ${err.message}`);
    }
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'Placement':
        return { label: 'Placement', bg: '#1e40af', icon: <PlacementIcon sx={{ fontSize: 14 }} /> };
      case 'Result':
        return { label: 'Result', bg: '#3b82f6', icon: <ResultIcon sx={{ fontSize: 14 }} /> };
      case 'Event':
      default:
        return { label: 'Event', bg: '#0ea5e9', icon: <EventIcon sx={{ fontSize: 14 }} /> };
    }
  };

  // Helper formatting relative time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const diffMs = new Date().getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins || 1} min ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (error) {
    return (
      <Box>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => loadDashboardData(true)}>
            Retry
          </Button>
        } sx={{ mb: 3 }}>
          Error loading dashboard data: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Top action section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Overview Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Real-time campus communications, exam schedules, and placement updates.
          </Typography>
        </Box>
        <IconButton onClick={() => loadDashboardData(true)} disabled={loading} color="primary" sx={{ border: '1px solid #e2e8f0', p: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Grid widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Notifications', value: stats?.total, icon: <BellIcon />, color: '#1a56db' },
          { label: 'Placements Drive', value: stats?.placements, icon: <PlacementIcon />, color: '#1e40af' },
          { label: 'Exam Results', value: stats?.results, icon: <ResultIcon />, color: '#3b82f6' },
          { label: 'Campus Events', value: stats?.events, icon: <EventIcon />, color: '#0ea5e9' }
        ].map((widget, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {widget.label}
                    </Typography>
                    {loading ? (
                      <Skeleton width={80} height={42} sx={{ mt: 1 }} />
                    ) : (
                      <Typography variant="h1" sx={{ fontWeight: 800, mt: 0.5, fontSize: '2rem' }}>
                        {widget.value}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${widget.color}15`,
                      color: widget.color,
                      borderRadius: 2.5,
                      width: 48,
                      height: 48
                    }}
                  >
                    {widget.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main dashboard columns */}
      <Grid container spacing={3}>
        {/* Recent Notifications list */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h3">
                Recent Broadcasts
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/notifications')}
                endIcon={<ArrowIcon />}
              >
                View All
              </Button>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <List>
                  {[1, 2, 3].map((n) => (
                    <Box key={n} sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Skeleton width={80} height={20} />
                        <Skeleton width={120} height={20} />
                      </Box>
                      <Skeleton width="100%" height={15} />
                      <Skeleton width="60%" height={15} sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                </List>
              ) : recent.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <BellIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5, mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    No notifications available
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
                    Your notification inbox is currently empty.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {recent.map((notif) => {
                    const badge = getBadgeConfig(notif.type);
                    return (
                      <ListItem
                        key={notif.id}
                        sx={{
                          p: 2.5,
                          borderBottom: '1px solid #f1f5f9',
                          bgcolor: notif.isRead ? 'transparent' : '#eff6ff30',
                          '&:hover': {
                            bgcolor: '#f8fafc'
                          },
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                              label={badge.label}
                              size="small"
                              icon={badge.icon}
                              sx={{
                                bgcolor: badge.bg,
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '& .MuiChip-icon': { color: '#ffffff' }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                              {formatTime(notif.createdAt)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: notif.isRead ? 600 : 700,
                              color: '#0f172a'
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {notif.message}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={notif.isRead ? 'Mark as unread' : 'Mark as read'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleRead(notif.id, notif.isRead)}
                              color={notif.isRead ? 'default' : 'primary'}
                            >
                              {notif.isRead ? <UnreadIcon /> : <ReadIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Info Card */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Priority engine pitch card */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#0f172a', color: '#ffffff', '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                    <PlacementIcon sx={{ color: '#38bdf8' }} />
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700 }}>
                      Heap Engine
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2.5, lineHeight: 1.6 }}>
                    Our core ranking algorithms route critical Placement notifications and Exam results to the top of your feed instantly. Equal weights break ties on chronological arrival.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/priority')}
                    sx={{
                      bgcolor: '#1a56db',
                      color: '#ffffff',
                      '&:hover': { bgcolor: '#2563eb' }
                    }}
                  >
                    Launch Priority Heap
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Read status ratio summary card */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Inbox Cleared
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-flex',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: `conic-gradient(#1a56db ${
                            stats ? ((stats.total - stats.unread) / stats.total) * 360 : 0
                          }deg, #f1f5f9 0deg)`,
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#ffffff'
                          }
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            position: 'relative',
                            fontWeight: 800,
                            color: '#1a56db'
                          }}
                        >
                          {stats
                            ? Math.round(((stats.total - stats.unread) / stats.total) * 100)
                            : 0}
                          %
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {stats ? stats.total - stats.unread : 0} of {stats?.total || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          notifications marked read. Keep your feed clear!
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
