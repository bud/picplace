import { ModalDialog, Button, DialogContent, DialogTitle, Modal, Stack, Divider } from '@mui/joy';
import React from 'react'

function RevertModal({ open, setOpen, onRevert }) {
  const handleRevert = React.useCallback(async event => {
    setOpen(false);
    onRevert();
  }, [setOpen, onRevert]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Are you sure?</DialogTitle>
        <DialogContent>This action is irreversible.</DialogContent>
        <Divider orientation='horizontal' inset="context" />
        <Stack gap={2} direction="row" mt={1}>
          <Button type="button" color="neutral" variant='plain' fullWidth onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" color='success' fullWidth onClick={handleRevert}>Revert</Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(RevertModal);