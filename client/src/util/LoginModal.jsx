import React from 'react';
import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, Stack } from '@mui/joy';
import { InfoOutlined } from '@mui/icons-material';
import { ModalDialog, FormHelperText } from '@mui/joy';

function LoginModal({ doLogin, open: loginModal, setOpen: setLoginModal, doRegister }) {
  const [usernameError, setUsernameError] = React.useState(null);
  const [passwordError, setPasswordError] = React.useState(null);

  const handleResetError = React.useCallback(() => {
    setUsernameError(null);
    setPasswordError(null);
  }, []);

  const handleAttemptLogin = React.useCallback(async event => {
    event.stopPropagation();
    event.preventDefault();

    const data = new FormData(event.target);

    const [good, error] = await doLogin(data.get('username'), data.get('password'));
    if (good) {
      setLoginModal(false);
    } else {
      if ("username" in error) setUsernameError(error.username);
      if ("password" in error) setPasswordError(error.username);
      if ("error" in error) setPasswordError(error.error);
    }
  }, [doLogin, setLoginModal]);

  return (
    <Modal open={loginModal} onClose={() => setLoginModal(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Ready to log in?</DialogTitle>
        <DialogContent>Here is your first quiz.</DialogContent>
        <form onSubmit={handleAttemptLogin}>
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
            <Stack gap={2}>
              <Button type="submit" fullWidth size="lg" sx={{ marginTop: "16px" }}>Submit</Button>
              <Stack direction="row" gap={2}>
                <Button type="button" color="neutral" variant='plain' fullWidth size='sm' onClick={() => setLoginModal(false)}>Maybe later</Button>
                <Button type="button" color="neutral" variant='outlined' fullWidth size='sm' onClick={doRegister}>I'm new here!</Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(LoginModal);