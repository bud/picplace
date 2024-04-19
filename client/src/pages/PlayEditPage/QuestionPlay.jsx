import { Button, Input, RadioGroup, Stack, Radio, FormControl, FormLabel } from '@mui/joy';
import React from 'react';
import ImagePicker from './ImagePicker';
import { calculateScore } from './similarity';

function QuestionPlay({ question, guess, onGuess }) {
  const [answer, setAnswer] = React.useState(guess?.match || guess?.guess);
  const [score, setScore] = React.useState(null);
  const [latitude, setLatitude] = React.useState(guess?.latitude);
  const [longitude, setLongitude] = React.useState(guess?.longitude);

  React.useEffect(() => {
    if (question?.image == null || answer == null) return;

    const i1 = new Image();
    i1.src = answer;
    i1.onload = () => {
      const i2 = new Image();
      i2.src = question?.image;
      i2.onload = () => {
        setScore(calculateScore(i1, i2));
      };
    };
  }, [answer, question?.image]);

  if (question.type === 'blank') {
    return (
      <Button onClick={() => onGuess({
        type: "blank"
      })}>Continue</Button>
    );
  } else if (question.type === 'match') {
    return (
      <Stack gap={2}>
        <ImagePicker answer={question?.image} image={answer} setImage={setAnswer} />
        { score != null &&
          <Input disabled variant="soft" value={`Score: ${score * 100}%`}/>
        }
        <Button disabled={answer == null} onClick={() => onGuess({
          type: "match",
          match: answer,
        })}>Continue</Button>
      </Stack>
    );
  } else if (question.type === 'choice') {
    console.log(answer);
    return (
      <Stack gap={2}>
        <RadioGroup defaultValue="" name="radio-buttons-group" onChange={e => setAnswer(e.target.value)}>
          {question.choices.map((c, i) => (
            <Radio value={c} label={c} variant={answer === c ? "solid" : "outlined"} />
          ))}
        </RadioGroup>
        <Button disabled={answer == null} onClick={() => onGuess({
          type: 'choice',
          guess: answer,
        })}>Continue</Button>
      </Stack>
    );
  } else if (question.type === 'location') {
    console.log(question, guess);
    return (
      <Stack direction="column" gap={2} flexWrap="wrap">
        <FormControl>
          <FormLabel>Latitude</FormLabel>
          <Input variant='soft' placeholder="Latitude here..." value={latitude ?? ""} onChange={e => isNaN(+e.target.value) ? null : setLatitude(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Longitude</FormLabel>
          <Input variant='soft' placeholder="Longitude here..." value={longitude ?? ""} onChange={e => isNaN(+e.target.value) ? null : setLongitude(e.target.value)} />
        </FormControl>
        <Button disabled={latitude == null || longitude == null} onClick={() => onGuess({
          type: 'location',
          latitude: latitude,
          longitude: longitude,
        })}>Continue</Button>
      </Stack>
    )
  }

  return (
    null
  );
}

export default React.memo(QuestionPlay);