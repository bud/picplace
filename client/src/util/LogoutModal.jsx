import { InfoOutlined } from '@mui/icons-material';
import { ModalDialog, Button, DialogContent, DialogTitle, FormControl, FormHelperText, Modal, Stack } from '@mui/joy';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function LogoutModal({ doLogout, open: logoutModal, setOpen: setLogoutModal }) {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = React.useState(null);

  const handleAttemptLogout = React.useCallback(async event => {
    event.stopPropagation();
    event.preventDefault();

    const [good, error] = await doLogout();

    if (good) {
      setLogoutModal(false);
      navigate('/');
    } else {
      if ("error" in error) setLogoutError(error.error);
    }
  }, [doLogout, navigate, setLogoutModal]);

  return (
    <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Going already?</DialogTitle>
        <DialogContent>Confirm to make sure.</DialogContent>
        <form onSubmit={handleAttemptLogout}>
            <FormControl error={logoutError != null}>
              { logoutError != null && 
                <FormHelperText>
                  <InfoOutlined />
                  {logoutError}
                </FormHelperText>
              }
            </FormControl>
          <Stack gap={1}>
            <Button type="submit" fullWidth size="lg" sx={{ marginTop: "16px" }}>I'm going</Button>
            <Button type="button" color="neutral" variant='plain' fullWidth size='sm' onClick={() => setLogoutModal(false)}>I'll stay</Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(LogoutModal);