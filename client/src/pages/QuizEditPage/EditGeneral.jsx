import { Button, Card, Divider, FormControl, FormHelperText, IconButton, Input, Stack, Textarea, ToggleButtonGroup, Typography } from '@mui/joy';
import moment from 'moment';
import React from 'react';
import ImageInput from '../../util/ImageInput';
import { ArrowDownwardRounded, ArrowUpwardRounded, PublicOffRounded, PublicRounded, SettingsRounded } from '@mui/icons-material';

function EditGeneral({ data, onData }) {
  const { created, name, description, thumbnail, timelimit, public: Public } = data ?? {};
  const [open, setOpen] = React.useState();

  const handleName = React.useCallback(e => {
    const { value } = e.target;
    onData(p => ({ ...p, name: value }));
  }, [onData]);

  const handleDescription = React.useCallback(e => {
    const { value } = e.target;
    onData(p => ({ ...p, description: value }));
  }, [onData]);

  const handleTimelimit = React.useCallback(e => {
    const { value } = e.target;
    if (isNaN(+value) && value !== "") return;
    onData(p => ({ ...p, timelimit: value === "" ? null : +value }));
  }, [onData]);

  const handleThumbnail = React.useCallback(({ url }) => {
    onData(p => ({ ...p, thumbnail: url }));
  }, [onData]);

  const handleVisible = React.useCallback((e, value) => {
    switch (value) {
      case "true":
        onData(p => ({ ...p, public: true }));
        break;
      default:
        onData(p => ({ ...p, public: false }));
        break;
    }
  }, [onData]);

  let visibilityString = Public ? 'true' : 'false';

  return (
    <Card sx={{ gap: 2 }}>
      <Stack direction='row' gap={2}>
        <Typography level="h3" startDecorator={<SettingsRounded />}>General Settings</Typography>
        <div style={{ flex: 1 }} />
        <IconButton onClick={() => setOpen(o => !o)}>{open ? <ArrowDownwardRounded/> : <ArrowUpwardRounded/>}</IconButton>
      </Stack>
      {open && <Divider orientation='horizontal' />}
      { open && <>
        <Stack gap={3} overflow="scroll" sx={{ '&::-webkit-scrollbar': { display: "none" } }}>
          <FormControl>
            <ImageInput image={thumbnail} alt={name} height={300} setImage={handleThumbnail} />
          </FormControl>
          <FormControl>
            <Input placeholder="Quiz title..." value={name} onChange={handleName} />
          </FormControl>
          <FormControl>
            <Input variant='soft' disabled value={`Created ${moment(new Date(created)).format("MMMM Do YYYY")}`} />
          </FormControl>
          <FormControl>
            <Textarea placeholder="Quiz description..." minRows={5} maxRows={5} value={description} onChange={handleDescription} />
          </FormControl>
          <FormControl>
            <Input placeholder="No limit." value={timelimit ?? ""} onChange={handleTimelimit} />
            <FormHelperText>Currently, users {timelimit == null ? "can take as long as they want" : `have ${timelimit} second${timelimit !== 1 ? "s" : ""}`} to finish the quiz.</FormHelperText>
          </FormControl>
          <FormControl>
            <ToggleButtonGroup value={visibilityString} onChange={handleVisible}>
              <Button fullWidth variant='soft' value="false" startDecorator={<PublicOffRounded fontSize='small' />}>
                Private
              </Button>
              <Button fullWidth variant='soft' value="true" startDecorator={<PublicRounded fontSize='small' />}>
                Public
              </Button>
            </ToggleButtonGroup>
            {visibilityString === "private" &&
              <FormHelperText>Only you can see this quiz.</FormHelperText>
            }
            {visibilityString === "public" &&
              <FormHelperText>Anyone can see this quiz.</FormHelperText>
            }
          </FormControl>
        </Stack>
      </>}
    </Card>

  );
}

export default React.memo(EditGeneral);