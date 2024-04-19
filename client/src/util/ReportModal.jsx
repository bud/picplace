import React from 'react';
import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, Stack } from '@mui/joy';
import { InfoOutlined } from '@mui/icons-material';
import { ModalDialog, FormHelperText } from '@mui/joy';
import InputItem from './InputItem';

function ReportModal({ doReport, open: reportModal, setOpen: setReportModal, type, id }) {
  const [error, setError] = React.useState(null);

  const handleResetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleAttemptReport = React.useCallback(async event => {
    event.stopPropagation();
    event.preventDefault();

    const form = new FormData(event.target);

    const [good, error] = await doReport(type, id, form.get('reason'));
    if (good) {
      setReportModal(false);
    } else {
      if ("error" in error) setError(error.error);
    }
  }, [doReport, setReportModal, id, type]);

  return (
    <Modal open={reportModal} onClose={() => setReportModal(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Found a bad?</DialogTitle>
        <DialogContent>Let us clean up.</DialogContent>
        <form onSubmit={handleAttemptReport}>
          <Stack spacing={2}>
            <FormControl error={error != null}>
              <FormLabel>Offender</FormLabel>
              <InputItem type={type} itemID={id} />
            </FormControl>
            <FormControl error={error != null}>
              <FormLabel>Report</FormLabel>
              <Input type="text" required name='reason' onChange={handleResetError} placeholder="Why is this item inappropriate?"/>
              { error != null && 
                <FormHelperText>
                  <InfoOutlined />
                  {error}
                </FormHelperText>
              }
            </FormControl>
            <Stack gap={2}>
              <Button type="submit" variant='solid' color="danger" fullWidth size="lg" sx={{ marginTop: "16px" }}>Submit</Button>
              <Button type="button" color="neutral" variant='plain' fullWidth size='sm' onClick={() => setReportModal(false)}>Maybe later</Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default React.memo(ReportModal);