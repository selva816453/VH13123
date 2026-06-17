import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  ButtonGroup,
  Button,
  Tooltip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  GridView as CardViewIcon,
  TableRows as TableViewIcon,
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

export function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 items per page fits card layout perfectly
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from service
  const fetchNotificationsData = useCallback(async (isManual = false) => {
    setLoading(true);
    setError(null);
    if (isManual) {
      Log('frontend', 'info', 'page', 'User triggered manual reload on Notifications list');
    }

    try {
      const typeParam = typeFilter === 'All' ? undefined : typeFilter;
      const data = await NotificationService.getNotifications({
        page,
        limit,
        notification_type: typeParam,
        search: searchQuery
      });

      setNotifications(data.notifications);
      setTotalPages(data.pagination.totalPages);
      Log(
        'frontend',
        'info',
        'page',
        `Fetched notifications page=${page}, typeFilter=${typeFilter}, count=${data.notifications.length}`
      );
    } catch (err: any) {
      const errMsg = err.message || 'Failed to fetch notifications list';
      setError(errMsg);
      Log('frontend', 'error', 'page', `Failed to load notifications: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, typeFilter, searchQuery]);

  useEffect(() => {
    fetchNotificationsData();
  }, [fetchNotificationsData]);

  // Handler for search typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(1); // Reset page to first page
    Log('frontend', 'debug', 'page', `Search query changed to: "${query}"`);
  };

  // Handler for type chips
  const handleFilterChange = (filter: string) => {
    setTypeFilter(filter);
    setPage(1); // Reset page to first page
    Log('frontend', 'info', 'page', `Notification type filter changed to: ${filter}`);
  };

  // Handler for page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    Log('frontend', 'info', 'page', `Pagination switched to page ${value}`);
  };

  // Toggle read/unread state
  const handleToggleRead = async (id: string, currentlyRead: boolean) => {
    try {
      Log('frontend', 'info', 'page', `Toggling read state for notification ${id} to ${!currentlyRead}`);
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
      Log('frontend', 'error', 'page', `Failed to toggle read state for notification ${id}: ${err.message}`);
    }
  };

  // Toggle layout mode
  const handleViewModeToggle = (mode: 'card' | 'table') => {
    setViewMode(mode);
    Log('frontend', 'info', 'page', `View mode layout toggled to: ${mode.toUpperCase()}`);
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'Placement':
        return { label: 'Placement', bg: '#1e40af', icon: <PlacementIcon sx={{ fontSize: 13 }} /> };
      case 'Result':
        return { label: 'Result', bg: '#3b82f6', icon: <ResultIcon sx={{ fontSize: 13 }} /> };
      case 'Event':
      default:
        return { label: 'Event', bg: '#0ea5e9', icon: <EventIcon sx={{ fontSize: 13 }} /> };
    }
  };

  const renderBadge = (type: string) => {
    const badge = getBadgeConfig(type);
    return (
      <Chip
        label={badge.label}
        size="small"
        icon={badge.icon}
        sx={{
          bgcolor: badge.bg,
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.7rem',
          '& .MuiChip-icon': { color: '#ffffff' }
        }}
      />
    );
  };

  return (
    <Box>
      {/* Control header actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['All', 'Placement', 'Result', 'Event'].map((filter) => (
            <Chip
              key={filter}
              label={`${filter}s`}
              onClick={() => handleFilterChange(filter)}
              variant={typeFilter === filter ? 'filled' : 'outlined'}
              color={typeFilter === filter ? 'primary' : 'default'}
              sx={{ fontWeight: 600, px: 0.5 }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, gap: 2 }}>
          <TextField
            placeholder="Search keywords..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ bgcolor: '#ffffff', borderRadius: 1.5, width: { xs: '100%', sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                </InputAdornment>
              )
            }}
          />

          <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: '#ffffff' }}>
            <Button
              onClick={() => handleViewModeToggle('card')}
              variant={viewMode === 'card' ? 'contained' : 'outlined'}
            >
              <CardViewIcon sx={{ fontSize: 18 }} />
            </Button>
            <Button
              onClick={() => handleViewModeToggle('table')}
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
            >
              <TableViewIcon sx={{ fontSize: 18 }} />
            </Button>
          </ButtonGroup>
          
          <IconButton onClick={() => fetchNotificationsData(true)} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to fetch notifications: {error}
        </Alert>
      )}

      {/* Main View rendering */}
      {/* 1. Loading Skeleton: Card View */}
      {loading && viewMode === 'card' && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card sx={{ p: 1.5 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton width={80} height={20} />
                  <Skeleton width="100%" height={24} />
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="80%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 2. Loading Skeleton: Table View */}
      {loading && viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={180} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4].map((n) => (
                <TableRow key={n}>
                  <TableCell><Skeleton width={50} /></TableCell>
                  <TableCell><Skeleton width={70} /></TableCell>
                  <TableCell><Skeleton width={150} /></TableCell>
                  <TableCell><Skeleton width={30} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 3. Empty State */}
      {!loading && notifications.length === 0 && (
        <Paper sx={{ py: 10, textAlign: 'center', bgcolor: '#ffffff' }}>
          <Typography variant="h4" sx={{ color: 'text.disabled', mb: 1 }}>
            No Notifications Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            We couldn't find any notifications matching the applied filters.
          </Typography>
        </Paper>
      )}

      {/* 4. Card View Content */}
      {!loading && notifications.length > 0 && viewMode === 'card' && (
        <Box>
          <Grid container spacing={3}>
            {notifications.map((notif) => (
              <Grid item xs={12} sm={6} md={4} key={notif.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: notif.isRead ? 'none' : '4px solid #1a56db',
                    bgcolor: notif.isRead ? 'transparent' : '#eff6ff30'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      {renderBadge(notif.type)}
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
                        mb: 1
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {notif.message}
                    </Typography>
                  </CardContent>
                  
                  <Box
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 0,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      borderTop: '1px solid #f8fafc'
                    }}
                  >
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
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 5. Table View Content */}
      {!loading && notifications.length > 0 && viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table aria-label="notifications table">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '120px' }}>Type</TableCell>
                <TableCell style={{ width: '180px' }}>Date</TableCell>
                <TableCell>Notification</TableCell>
                <TableCell style={{ width: '100px', textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notif) => (
                <TableRow
                  key={notif.id}
                  sx={{
                    bgcolor: notif.isRead ? 'transparent' : '#eff6ff20',
                    fontWeight: notif.isRead ? 'normal' : 'bold',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell>{renderBadge(notif.type)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notif.isRead ? 500 : 700,
                        color: 'text.primary'
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {notif.message}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title={notif.isRead ? 'Mark as unread' : 'Mark as read'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRead(notif.id, notif.isRead)}
                        color={notif.isRead ? 'default' : 'primary'}
                      >
                        {notif.isRead ? <UnreadIcon /> : <ReadIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination wrapper */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
