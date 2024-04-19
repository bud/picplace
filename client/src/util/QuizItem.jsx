import { HourglassBottomRounded, LeaderboardRounded, QuestionMarkRounded, ThumbUpRounded } from '@mui/icons-material';
import { Card, CardContent, CardOverflow, Divider, Sheet, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const NUMBER_FORM = Intl.NumberFormat('en', { notation: 'compact' });

function QuizItem({
  Id: id, name, thumbnail, description, created, timelimit, totalLikes,
  totalQuestions, public: d, likes, plays
}) {
  totalLikes ??= 0;
  totalQuestions ??= 0;
  d ??= false;
  likes ??= 0;
  plays ??= 0;
  created ??= "-1";

  console.log("sdfdsdfgfds",id);

  return (
    <RouterLink to={`/quiz/${id}`} style={{ textDecoration: "none", flex: 1, minWidth: 300, maxWidth: 600 }}>
      <Card variant="outlined">
        { thumbnail ? ( 
          <img src={thumbnail} loading="lazy" alt={name} height={150} style={{ objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <Sheet color='neutral' variant='soft' sx={{ height: 150, borderRadius: 8 }}></Sheet>
        )}
        <Stack gap={1} mb="auto">
          { (name == null || name === "") ? (
            <Typography level='h4' fontStyle="italic" color="neutral" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: '2lh' }}>Unnamed Quiz</Typography>
          ) : (
            <Typography level='h4' sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: '2lh' }}>{name}</Typography>
          )}
          { (description == null || description === "") ? (
            <Typography level="body-sm" fontStyle="italic" color="neutral" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: '3lh' }}>No description.</Typography>
          ) : (
            <Typography level="body-sm" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: '3lh' }}>{description}</Typography>
          )}
        </Stack>
        <CardOverflow>
          <CardContent orientation="horizontal">
            <Typography startDecorator={<LeaderboardRounded color="action" fontSize="small" />} level="body-xs">{NUMBER_FORM.format(plays)}</Typography>
            <Divider orientation="vertical" />
            <Typography startDecorator={<ThumbUpRounded color="action" fontSize="small" />} level="body-xs">{totalLikes}</Typography>
            {timelimit &&
              <>
                <Divider orientation="vertical" />
                <Typography startDecorator={<HourglassBottomRounded color="action" fontSize="small" />} level="body-xs">{timelimit}</Typography>
              </>
            }
            <Divider orientation="vertical" />
            <Typography startDecorator={<QuestionMarkRounded color="action" fontSize="small" />} level="body-xs">{totalQuestions}</Typography>
          </CardContent>
        </CardOverflow>
      </Card>
    </RouterLink>
  );
}

export default React.memo(QuizItem);