import { Snackbar, Stack, Typography } from '@mui/joy';
import React from 'react';

function LoadingPage({ error }) {
  const [open, setOpen] = React.useState(error != null);

  React.useEffect(() => {
    setOpen(error != null);
  }, [error]);

  return (
    <Stack alignItems="center" gap={4} justifyContent="center" height={1}>
      <Typography level="h1" fontSize={64}>Loading...</Typography>
      {error &&
        <Snackbar
        open={open}
        color="danger"
        variant="outlined"
        onClose={(event, reason) => {
          if (reason === 'clickaway') { return; }
          setOpen(false);
        }}>
        {error}
      </Snackbar>
      }
    </Stack>
  );
}

export default React.memo(LoadingPage);