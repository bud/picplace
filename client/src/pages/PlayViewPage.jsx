import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Stack, Sheet, Button } from '@mui/joy';
import LoadingPage from './LoadingPage';
import moment from 'moment';

const PlayViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [playData, setPlayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/play/${id}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Error fetching play data');
        }
        const data = await response.json();
        setPlayData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayData();
  }, [id]);

  if (loading) {
    return <LoadingPage/>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  let time;

  const timeout = playData.end || (playData.timelimit - moment.duration(moment(new Date()).diff(playData.start)).asSeconds() > 0);

  if (playData.end) {
    time = moment.duration(moment(playData.end).diff(playData.start)).asSeconds();
  } else if (playData.timelimit) {
    time = `${playData.timelimit} seconds`
  } else {
    time = moment.duration(moment(new Date()).diff(playData.start)).asSeconds();
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Play Details
      </Typography>
      {playData ? (
        <Sheet elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h6">Quiz ID: {playData.quiz}</Typography>
          <Typography>User ID: {playData.user}</Typography>
          <Typography>Completed: {playData.isScored ? 'Yes' : 'No'}</Typography>
          <Typography>Time Elapsed: {time} seconds</Typography>
          <Stack>
            {timeout && playData.scores.map((score, index) => (
              <>
                <Typography>Total Score: {Math.round(playData.totalScore)}</Typography>
                <Typography key={index}>Question {index + 1}: {Math.round(score)} points</Typography>
              </>
            ))}
          </Stack>
          {timeout && (
            <Button onClick={() => navigate('edit')}>View</Button>
          )}
        </Sheet>
      ) : (
        <Typography>No play data available.</Typography>
      )}
    </Stack>
  );
};

export default PlayViewPage;
