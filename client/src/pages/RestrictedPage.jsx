import { BlockRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/joy';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../util/UserContext';

function RestrictedPage() {
  useAuth();
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1} height={1}>
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" height={1}>
        <Stack gap={6} alignItems="center" justifyContent="center" height={1}>
          <BlockRounded color="disabled" sx={{ fontSize: 160 }} />
          <Stack gap={2} alignItems="center">
            <Typography level="h2" fontSize={48}>Not so fast!</Typography>
            <Typography level="body-md" textAlign="center" mb={3}>The page is restricted! The owner does not want you to see this.</Typography>
            <Stack direction="row" gap={2}>
              <Button onClick={() => navigate(-1)} variant='soft' color='neutral'>Go back</Button>
              <Button onClick={() => navigate(0)}>Refresh</Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default React.memo(RestrictedPage);