import { QuestionMarkRounded } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/joy';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../util/UserContext';

function NoFoundPage() {
  useAuth();
  const navigate = useNavigate();
  console.log(window.location.href);
  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1} height={1}>
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" height={1}>
        <Stack alignItems="center" gap={8} justifyContent="center" height={1}>
          <QuestionMarkRounded color="disabled" sx={{ fontSize: 160 }} />
          <Stack gap={2} alignItems="center">
            <Typography level="h2" fontSize={48}>Woah there!</Typography>
            <Typography level="body-md" textAlign="center" mb={3}>Looks like you're lost! What you are looking for does not exist, or is privated by its owner.</Typography>
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

export default React.memo(NoFoundPage);