import { BlockRounded, DeleteOutlineRounded, ImageOutlined } from '@mui/icons-material';
import { Box, Button, Card, Divider, IconButton, Stack, Typography } from '@mui/joy';
import React from 'react';

function ImageInput({ alt, image, setImage, height = 150, variant = 'plain' }) {
  const ref = React.useRef(null);

  const handleInput = React.useCallback(() => {
    if (ref.current == null) return;
    const file = ref.current.files[0];
    setImage({ url: URL.createObjectURL(file), file });
  }, [setImage]);

  const handleAddFile = React.useCallback(() => {
    if (ref.current == null) return;
    ref.current.click();
  }, []);

  const handleRemoveFile = React.useCallback(() => {
    if (ref.current == null) return;
    ref.current.value = '';
    setImage({ url: null, file: null });
  }, [setImage]);

  return (
    <Card sx={{ p: 0, gap: 0, overflow: "hidden" }} variant={variant === 'plain' ? 'outlined' : variant}>
      <input type="file" hidden ref={ref} onChange={handleInput} accept='.png,.jpeg,.jpg,.webp'/>
      {image ? (
        <img src={image} alt={alt ?? "Example."} height={height} style={{ objectFit: "cover", borderRadius: 0, width: "100%" }} />
      ) : (
        <Box flexDirection="column" width={1} display="flex" height={height} bgcolor="#0001" alignItems="center" justifyContent="center">
          <BlockRounded color="disabled" sx={{ fontSize: 64 }} />
          <Typography>No image found.</Typography>
        </Box>
      )}
      <Divider orientation='horizontal' />
      <Stack direction="row">
        <Button color="neutral" startDecorator={<ImageOutlined />} fullWidth variant={variant} sx={{ borderRadius: 0 }} onClick={handleAddFile}>Upload New Image</Button>
        <Divider orientation='vertical' />
        <IconButton color='neutral' variant={variant} sx={{ borderRadius: 0 }} onClick={handleRemoveFile}>
          <DeleteOutlineRounded />
        </IconButton>
      </Stack>
    </Card>
  );
}

export default React.memo(ImageInput);