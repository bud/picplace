import React from 'react';
import { useAuth } from './UserContext';
import { Avatar, Button, IconButton, Stack, Typography } from '@mui/joy';
import { LoginRounded, LogoutRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

function Navatar() {
  const [user, promptLogin, promptLogout] = useAuth();

  if (user == null) {
    return (
      <Button color="primary" variant="soft"
        startDecorator={<LoginRounded fontSize="small" />}
        onClick={promptLogin}>Log in</Button>
    );
  } else {
    return (
      <Stack direction="row" alignItems="center" gap={2} width={1} overflow="hidden">
        <Avatar alt="Remy Sharp" src={user.profile} size="md" component={RouterLink} to="/me" />
        <Stack width={1} overflow="hidden">
          <Typography width={1} fontWeight="lg" component="pre" level="body-md" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{user.username}</Typography>
          <Typography width={1} level="body-xs" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{user.description}</Typography>
        </Stack>
        <IconButton onClick={promptLogout}>
          <LogoutRounded />
        </IconButton>
      </Stack>
    );
  }
}

export default React.memo(Navatar);