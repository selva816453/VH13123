import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Paper,
  Button
} from '@mui/material';
import {
  Star as StarIcon,
  MarkChatRead as ReadIcon,
  MarkChatUnread as UnreadIcon,
  Work as PlacementIcon,
  Assessment as ResultIcon,
  Event as EventIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { NotificationService } from '../services/api';
import { Log } from '../utils/logger';
import { Notification } from '../types';

export function PriorityNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend priority engine
  const fetchPriorityData = async (isManual = false) => {
    setLoading(true);
    setError(null);
    if (isManual) {
      Log('frontend', 'info', 'page', 'User manually refreshed priority notifications queue list');
    } else {
      Log('frontend', 'debug', 'page', 'Priority notifications listing load initiated');
    }

    try {
      const data = await NotificationService.getPriorityNotifications();
      setNotifications(data);
      Log('frontend', 'info', 'page', `Successfully loaded ${data.length} priority notifications from Max-Heap`);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to fetch priority notifications';
      setError(errMsg);
      Log('frontend', 'error', 'page', `Priority load failure: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityData();
  }, []);

  const handleToggleRead = async (id: string, currentlyRead: boolean) => {
    try {
      Log('frontend', 'info', 'page', `Toggling read state for priority notification ${id} to ${!currentlyRead}`);
      if (currentlyRead) {
        await NotificationService.markAsUnread(id);
      } else {
        await NotificationService.markAsRead(id);
      }
      
      // Snappy update to state list
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: !currentlyRead } : n))
      );
    } catch (err: any) {
      Log('frontend', 'error', 'page', `Failed to toggle read state for priority notification ${id}: ${err.message}`);
    }
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'Placement':
        return { label: 'Placement (P3)', bg: '#1e40af', icon: <PlacementIcon sx={{ fontSize: 13 }} /> };
      case 'Result':
        return { label: 'Result (P2)', bg: '#3b82f6', icon: <ResultIcon sx={{ fontSize: 13 }} /> };
      case 'Event':
      default:
        return { label: 'Event (P1)', bg: '#0ea5e9', icon: <EventIcon sx={{ fontSize: 13 }} /> };
    }
  };

  const getRankBadgeStyles = (index: number) => {
    // Top 3 ranks get gold, silver, bronze themed highlights
    if (index === 0) return { bg: '#fef08a', text: '#854d0e', border: '#eab308' }; // Gold
    if (index === 1) return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }; // Silver
    if (index === 2) return { bg: '#ffedd5', text: '#c2410c', border: '#f97316' }; // Bronze
    return { bg: '#eff6ff', text: '#1a56db', border: '#bfdbfe' }; // Default blue indices
  };

  return (
    <Box>
      {/* Page Header and Rules card */}
      <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', mb: 4, '&:hover': { boxShadow: 'none' } }}>
        <CardContent sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1a56db',
              borderRadius: 3,
              width: 56,
              height: 56,
              color: '#ffffff'
            }}
          >
            <StarIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ color: '#1e40af', fontWeight: 800 }}>
              Priority Ranking Engine (Top 10)
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e3a8a', mt: 0.5, lineHeight: 1.5 }}>
              How it works: Backend processes raw notifications using a <strong>Max-Heap</strong>.
              Priority ranks as: <strong>Placement (3) &gt; Result (2) &gt; Event (1)</strong>.
              If two items share priority weights, the tie breaks in favor of the newer timestamp.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => fetchPriorityData(true)}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{ bgcolor: '#1a56db' }}
          >
            Re-run Heap
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to compute priority ranks: {error}
        </Alert>
      )}

      {/* Ranks list */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[1, 2, 3].map((n) => (
            <Card key={n} sx={{ p: 1 }}>
              <CardContent sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width={120} height={20} sx={{ mb: 1 }} />
                  <Skeleton width="100%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="80%" height={16} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Paper sx={{ py: 10, textAlign: 'center', bgcolor: '#ffffff' }}>
          <Typography variant="h4" sx={{ color: 'text.disabled', mb: 1 }}>
            No Priority Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            There are no events loaded in memory to sort.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {notifications.map((notif, index) => {
            const badge = getBadgeConfig(notif.type);
            const rankStyle = getRankBadgeStyles(index);
            return (
              <Card
                key={notif.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: { xs: 1.5, sm: 2.5 },
                  borderLeft: notif.isRead ? 'none' : '4px solid #1a56db',
                  bgcolor: notif.isRead ? 'transparent' : '#eff6ff25'
                }}
              >
                {/* Visual Rank Indicator */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 36, sm: 48 },
                    height: { xs: 36, sm: 48 },
                    borderRadius: '50%',
                    bgcolor: rankStyle.bg,
                    color: rankStyle.text,
                    border: `2px solid ${rankStyle.border}`,
                    fontWeight: 800,
                    fontSize: { xs: '0.85rem', sm: '1.1rem' },
                    mr: { xs: 2, sm: 3 },
                    flexShrink: 0
                  }}
                >
                  #{index + 1}
                </Box>

                {/* Content body */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                    <Chip
                      label={badge.label}
                      size="small"
                      icon={badge.icon}
                      sx={{
                        bgcolor: badge.bg,
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        '& .MuiChip-icon': { color: '#ffffff' }
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: notif.isRead ? 600 : 800,
                      color: 'text.primary',
                      mb: 0.5,
                      fontSize: { xs: '0.95rem', sm: '1.1rem' }
                    }}
                  >
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {notif.message}
                  </Typography>
                </Box>

                {/* Mark as read/unread Actions */}
                <Box sx={{ ml: 2 }}>
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
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
