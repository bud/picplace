import { Button, Input } from '@mui/joy';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = event.target.search.value;
    navigate(`/explore?search=${searchTerm}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>PicPlace</h1>
      <p style={styles.motto}>Capture, Share, Discover</p>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <Input
          name="search"
          variant="outlined"
          placeholder="Search for quizzes..."
          fullWidth
          sx={styles.searchInput}
        />
      </form>
      <div style={styles.heroSection}>
        <h2 style={styles.heroTitle}>Create Your Own Quizzes</h2>
        <p style={styles.heroText}>Design quizzes on your favorite topics and share them with the world.</p>
        <Button onClick={() => navigate('/me/quizzes')} variant="solid">My Quizzes</Button>
      </div>
      <div style={styles.heroSection}>
        <h2 style={styles.heroTitle}>Find Quizzes</h2>
        <p style={styles.heroText}>Explore quizzes to test your knowledge on subjects you're passionate about.</p>
        <Button style={styles.heroButton} variant="solid" onClick={() => navigate('/explore?type=quiz')}>Explore Quizzes</Button>
      </div>
      <div style={styles.heroSection}>
        <h2 style={styles.heroTitle}>Compete And Compare</h2>
        <p style={styles.heroText}>See how you stack up against others in your favorite quiz topics.</p>
        <Button style={styles.heroButton} variant="solid" onClick={() => navigate('/explore?type=user')}>Compare Scores</Button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Noto Sans, sans-serif',
    textAlign: 'center',
    padding: '20px 10px',
  },
  title: {
    fontSize: '48px',
    margin: '2px 0 10px 0',
  },
  motto: {
    fontSize: '24px',
    margin: '-15px 0 10px 0',
  },
  searchForm: {
    margin: '10px 0 10px 0',
  },
  searchInput: {
    margin: '0 auto',
    width: '80%',
  },
  heroSection: {
    margin: '15px 0',
  },
  heroTitle: {
    fontSize: '28px',
    margin: '10px 0',
  },
  heroText: {
    fontSize: '16px',
    margin: '-5px 0 10px 0',
  },
  heroButton: {
    margin: '5px',
  },
};

export default React.memo(HomePage);
