import { ModalDialog, Button, DialogContent, DialogTitle, Modal, Stack, Divider } from '@mui/joy';
import React from 'react'

function DeleteModal({ open, setOpen, onDelete }) {
  const handledelete = React.useCallback(async event => {
    setOpen(false);
    onDelete();
  }, [setOpen, onDelete]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Are you sure?</DialogTitle>
        <DialogContent>This action is irreversible.</DialogContent>
        <Divider orientation='horizontal' inset="context" />
        <Stack gap={2} direction="row" mt={1}>
          <Button type="button" color="neutral" variant='plain' fullWidth onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" color='danger' fullWidth onClick={handledelete}>Delete</Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(DeleteModal);