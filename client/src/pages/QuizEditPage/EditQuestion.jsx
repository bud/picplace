import { Button, Card, Divider, FormControl, FormHelperText, FormLabel, IconButton, Input, Stack, Textarea, ToggleButtonGroup, Typography } from '@mui/joy';
import React from 'react';
import ImageInput from '../../util/ImageInput';
import { ArrowDownwardRounded, ArrowUpwardRounded, BlockOutlined, CameraAltRounded, DeleteRounded, ExtensionRounded, PinDropRounded, QuestionAnswerRounded } from '@mui/icons-material';
import RespButton from '../../util/RespButton';

function EditQuestion({ data, onData, index }) {
  const { type, name, description, image, answer, choices, latitude, longitude } = data;
  const [open, setOpen] = React.useState();

  const handleType = React.useCallback((_, value) => {
    onData(p => {
      const newQuestions = [...p];
      const Question = { ...newQuestions[index] };
      const newQuestion = {};
      if (Question.image) newQuestion.image = Question.image;
      if (Question.description) newQuestion.description = Question.description;
      if (Question.name) newQuestion.name = Question.name;
      newQuestions[index] = newQuestion;

      newQuestion.type = value;
      if (value === 'blank') {
      } else if (value === 'choice') {
        newQuestion.answer = null;
        newQuestion.choices = [];
      } else if (value === 'match') {
      } else if (value === 'location') {
        newQuestion.latitude = null;
        newQuestion.longitude = null;
      }
      return newQuestions;
    });
  }, [onData, index]);

  const handleName = React.useCallback(e => {
    const { value } = e.target;
    onData(p => {
      const newQuestions = [...p];
      newQuestions[index] = { ...newQuestions[index], name: value };
      return newQuestions;
    });
  }, [onData, index]);

  const handleDescription = React.useCallback(e => {
    const { value } = e.target;
    onData(p => {
      const newQuestions = [...p];
      newQuestions[index] = { ...newQuestions[index], description: value };
      return newQuestions;
    });
  }, [onData, index]);

  const handleThumbnail = React.useCallback(({ url, file }) => {
    console.log("THUMB");
    onData(p => {
      const newQuestions = [...p];
      newQuestions[index] = { ...newQuestions[index], image: url };
      return newQuestions;
    });
  }, [onData, index]);

  const handleLatitude = React.useCallback(e => {
    const { value } = e.target;
    onData(p => {
      const newQuestions = [...p];
      const newQuestion = { ...newQuestions[index] };
      newQuestions[index] = newQuestion;

      newQuestion.latitude = value;
      return newQuestions;
    });
  }, [onData, index]);

  const handleLongitude = React.useCallback(e => {
    const { value } = e.target;
    onData(p => {
      const newQuestions = [...p];
      const newQuestion = { ...newQuestions[index] };
      newQuestions[index] = newQuestion;

      newQuestion.longitude = value;
      return newQuestions;
    });
  }, [onData, index]);

  const handleDelete = React.useCallback(() => {
    onData(p => {
      const newQuestions = [...p];
      newQuestions.splice(index, 1);

      return newQuestions;
    });
  }, [onData, index])

  const handleChoices = React.useCallback(e => {
    const { value } = e.target;
    onData(p => {
      const newQuestions = [...p];
      const newQuestion = { ...newQuestions[index] };
      newQuestions[index] = newQuestion;

      newQuestion.choices = value.split('\n');
      newQuestion.answer = 0;
      return newQuestions;
    });
  }, [onData, index]);

  return (
    <Card>
      <Stack gap={2} width={1}>
        <Stack direction='row' gap={2} alignItems="center">
          <Typography level="h3" startDecorator={<QuestionAnswerRounded />}>Q{index + 1}</Typography>
          <div style={{ flex: 1 }} />
          <RespButton variant="soft" color="danger" icon={DeleteRounded} onClick={handleDelete} label="Delete" breakpoint={500} />
          <IconButton onClick={() => setOpen(o => !o)}>{open ? <ArrowDownwardRounded /> : <ArrowUpwardRounded />}</IconButton>
        </Stack>
        {open && <>
          <ImageInput image={image} alt={name} setImage={handleThumbnail} height={300} variant='soft' />
          <FormControl>
            <FormLabel>Question Title</FormLabel>
            <Input variant='soft' placeholder="Name your quiz..." value={name} onChange={handleName} />
          </FormControl>
          <FormControl>
            <FormLabel>Question Description</FormLabel>
            <Textarea variant='soft' placeholder="Describe your quiz..." minRows={5} maxRows={5} value={description} onChange={handleDescription} />
          </FormControl>
          <Divider inset="context" orientation='horizontal' />
          <FormControl>
            <FormLabel>Question Type</FormLabel>
            <ToggleButtonGroup variant='soft' value={type} onChange={handleType}>
              <Button fullWidth value="blank" startDecorator={<BlockOutlined fontSize='small' />}>
                Blank
              </Button>
              <Button fullWidth value="match" startDecorator={<CameraAltRounded fontSize='small' />}>
                Match
              </Button>
              <Button fullWidth value="location" startDecorator={<PinDropRounded fontSize='small' />}>
                Location
              </Button>
              <Button fullWidth value="choice" startDecorator={<ExtensionRounded fontSize='small' />}>
                Choice
              </Button>
            </ToggleButtonGroup>
            {type === "blank" &&
              <FormHelperText>A blank question. The user can choose to ignore it.</FormHelperText>
            }
            {type === "match" &&
              <FormHelperText>The user must upload an image that most resembles this image.</FormHelperText>
            }
            {type === "location" &&
              <FormHelperText>The user must choose closest location to the image.</FormHelperText>
            }
            {type === "choice" &&
              <FormHelperText>The user must choose the best answer to the question.</FormHelperText>
            }
          </FormControl>
          {type === 'location' &&
            <Stack direction="row" gap={2}>
              <FormControl>
                <FormLabel>Latitude</FormLabel>
                <Input variant='soft' placeholder="Latitude here..." value={latitude ?? ""} onChange={handleLatitude} />
              </FormControl>
              <FormControl>
                <FormLabel>Longitude</FormLabel>
                <Input variant='soft' placeholder="Longitude here..." value={longitude ?? ""} onChange={handleLongitude} />
              </FormControl>
            </Stack>
          }
          {type === 'choice' &&
            <Stack>
              <FormControl>
                <FormLabel>Answers</FormLabel>
                <Textarea variant='soft' placeholder="Write you answers..." minRows={5} maxRows={5} value={choices.join('\n')} onChange={handleChoices} />
                <FormHelperText>The choices are separated by a new line. The first choice is the answer.</FormHelperText>
              </FormControl>
            </Stack>
          }
        </>}
      </Stack>
    </Card>
  )
}

export default React.memo(EditQuestion);