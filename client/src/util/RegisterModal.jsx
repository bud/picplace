import { InfoOutlined } from '@mui/icons-material';
import { ModalDialog, Button, DialogContent, DialogTitle, FormControl, FormHelperText, Modal, Stack, FormLabel, Input } from '@mui/joy';
import React from 'react'

function RegisterModal({ doRegister, open: registerModal, setOpen: setRegisterModal, doLogin }) {
  const [usernameError, setUsernameError] = React.useState(null);
  const [passwordError, setPasswordError] = React.useState(null);
  const [confirmError, setConfirmError] = React.useState(null);

  const handleResetError = React.useCallback(() => {
    setUsernameError(null);
    setPasswordError(null);
    setConfirmError(null);
  }, []);

  const handleAttemptRegister = React.useCallback(async event => {
    event.stopPropagation();
    event.preventDefault();

    const data = new FormData(event.target);

    if (data.get('password') !== data.get('confirm')) {
      setConfirmError("Passwords do not match.");
      return;
    }

    const [good, error] = await doRegister(data.get('username'), data.get('password'));
    if (good) {
      setRegisterModal(false);
    } else {
      if ("username" in error) setUsernameError(error.username);
      if ("password" in error) setPasswordError(error.username);
      if ("error" in error) setConfirmError(error.error);
    }
  }, [doRegister, setRegisterModal]);

  return (
    <Modal open={registerModal} onClose={() => setRegisterModal(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>New here?</DialogTitle>
        <DialogContent>Let's get you set up.</DialogContent>
        <form onSubmit={handleAttemptRegister}>
          <Stack spacing={2}>
            <FormControl error={usernameError != null}>
              <FormLabel sx={{ marginTop: "16px" }}>Username</FormLabel>
              <Input autoFocus required name='username' onChange={handleResetError}/>
              { usernameError != null && 
                <FormHelperText>
                  <InfoOutlined />
                  {usernameError}
                </FormHelperText>
              }
            </FormControl>
            <FormControl error={passwordError != null}>
              <FormLabel>Password</FormLabel>
              <Input type="password" required name='password' onChange={handleResetError}/>
              { passwordError != null && 
                <FormHelperText>
                  <InfoOutlined />
                  {passwordError}
                </FormHelperText>
              }
            </FormControl>
            <FormControl error={confirmError != null}>
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" required name='confirm' onChange={handleResetError}/>
              { confirmError != null && 
                <FormHelperText>
                  <InfoOutlined />
                  {confirmError}
                </FormHelperText>
              }
            </FormControl>
            <Stack gap={2}>
              <Button type="submit" fullWidth size="lg" sx={{ marginTop: "16px" }}>Submit</Button>
              <Stack direction="row" gap={2}>
                <Button type="button" color="neutral" variant='plain' fullWidth size='sm' onClick={() => setRegisterModal(false)}>Maybe later</Button>
                <Button type="button" color="neutral" variant='outlined' fullWidth size='sm' onClick={doLogin}>I'm a regular!</Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(RegisterModal);