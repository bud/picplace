import { BlockRounded, CameraRounded } from '@mui/icons-material';
import { Button, Stack, Card, Box, Divider, IconButton } from '@mui/joy';
import React from 'react'
import { DeleteOutlineRounded, ImageOutlined } from '@mui/icons-material';
import { Typography } from '@mui/joy';
import { useDebounce, useWindowSize } from '@uidotdev/usehooks';
import { calculateScore, getCenterCrop } from './similarity';

function ImagePicker({ answer, image, setImage }) {
  const ref = React.useRef(null);
  const [picker, setPicker] = React.useState(false);

  const handleInput = React.useCallback(() => {
    if (ref.current == null) return;
    const file = ref.current.files[0];
    setImage(URL.createObjectURL(file));
  }, [setImage]);

  const handleAddFile = React.useCallback(() => {
    if (ref.current == null) return;
    ref.current.click();
  }, []);

  const handleRemoveFile = React.useCallback(() => {
    if (ref.current == null) return;
    ref.current.value = '';
    setImage(null);
  }, [setImage]);

  const video = React.useRef(null);
  const canvas = React.useRef(null);
  const { width: W, height: H } = useWindowSize();
  const [answerData, setAnswerData] = React.useState(null);

  const [width, height] = useDebounce([W, H], 200);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [score, setScore] = React.useState(null);

  const handleCapture = React.useCallback(async () => {
    if (!isPlaying) return;
    const [x, y, w, h] = getCenterCrop({ width: W, height: H }, answerData);
    const temp = new OffscreenCanvas(w, h);

    const ctx = temp.getContext('2d');
    ctx.drawImage(video.current, x, y, w, h, 0, 0, w, h);

    const blob = await temp.convertToBlob();
    setImage(URL.createObjectURL(blob));
    setPicker(false);
  }, [isPlaying, setImage, W, H, answerData]);

  React.useEffect(() => {
    const image = new Image();
    image.src = answer;
    image.onload = () => setAnswerData(image);
  }, [answer, width, height]);

  React.useEffect(() => {
    if (canvas.current == null || answerData == null) return;
    const [x, y, w, h] = getCenterCrop({ width: W, height: H }, answerData);
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.current.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(answerData, x, y, w, h);
  }, [answerData, width, height, W, H])

  React.useEffect(() => {
    if (video.current == null || width == null || height == null) return;

    let stream;
    let good = true;
    let _video = video.current;

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width, height }, audio: false });
        if (!good) return;
        _video.srcObject = stream;
        _video.play();
        setIsPlaying(true);
      } catch (err) {
        alert(err);
      }
    })();

    return () => {
      setIsPlaying(false);
      good = false;
      if (stream == null) return;
      stream.getTracks().forEach(track => track.stop());
      if (_video == null) return;
      _video.srcObject = null;
    };
  }, [height, width]);

  React.useEffect(() => {
    if (!isPlaying || !picker) return;

    const interval = setInterval(() => {
      setScore(calculateScore(answerData, video.current));
    }, 500);

    return () => {
      setScore(null);
      clearInterval(interval);
    };
  }, [picker, isPlaying, width, height, answerData]);


  return (
    <Card sx={{ p: 0, gap: 0, overflow: "hidden" }} variant="outlined">
      <input type="file" hidden ref={ref} onChange={handleInput} accept='.png,.jpeg,.jpg,.webp' />
      {image ? (
        <img src={image} alt="Example." height={300} style={{ objectFit: "cover", borderRadius: 0, width: "100%" }} />
      ) : (
        <Box flexDirection="column" width={1} display="flex" height={150} bgcolor="#0001" alignItems="center" justifyContent="center">
          <BlockRounded color="disabled" sx={{ fontSize: 64 }} />
          <Typography>No image found.</Typography>
        </Box>
      )}
      <Divider orientation='horizontal' />
      <Stack direction="row">
        <Button color="neutral" startDecorator={<ImageOutlined />} fullWidth variant='plain' sx={{ borderRadius: 0 }} onClick={handleAddFile}>Upload</Button>
        <Divider orientation='vertical' />
        <Button color="neutral" startDecorator={<CameraRounded />} fullWidth variant='plain' sx={{ borderRadius: 0 }} onClick={() => setPicker(true)}>Capture</Button>
        <Divider orientation='vertical' />
        <IconButton color='neutral' variant='plain' sx={{ borderRadius: 0 }} onClick={handleRemoveFile}>
          <DeleteOutlineRounded />
        </IconButton>
      </Stack>
      <video hidden={!picker} ref={video} width={width} height={height} autoPlay playsInline loop style={{ position: "fixed", top: 0, left: 0, backgroundColor: "black", pointerEvents: "none", zIndex: 1000 }} />
      <canvas hidden={!picker} ref={canvas} width={width} height={height} style={{ position: "fixed", top: 0, left: 0, zIndex: 1001, opacity: 0.5 }} />
      <Button variant='solid' style={{ display: picker ? 'flex' : 'none', position: "fixed", bottom: 25, left: "50%", transform: "translateX(-50%)", zIndex: 1004 }} onClick={handleCapture}>Capture</Button>
      { score &&
        <button hidden={!picker} style={{ position: "fixed", top: 20, right: 20, zIndex: 1004 }} >{(100 * score).toFixed(2)}%</button>
      }
    </Card>
  );
}

export default React.memo(ImagePicker);