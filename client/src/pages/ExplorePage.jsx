import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Tabs, Tab, Stack, Breadcrumbs, TabList, Divider, CircularProgress, Input, Modal, DialogContent, DialogTitle, ModalDialog, Button, FormControl, FormLabel, ToggleButtonGroup, FormHelperText } from '@mui/joy';
import { ChevronRightRounded, FolderRounded, HomeRounded, PersonRounded, PlayArrowRounded, SearchRounded, TuneRounded } from '@mui/icons-material';
import { Link } from '@mui/joy';
import { Link as RouterLink } from 'react-router-dom';
import QuizItem from '../util/QuizItem';
import UserItem from '../util/UserItem';
import useFetchyeBatch from '../util/useFetchyeBatch';
import { useWindowSize } from '@uidotdev/usehooks';

/*----------------------------------------------------------------------------*/

function ExploreFilterModal({ open, setOpen }) {
  const [_params, setParams] = useSearchParams();
  const params = Object.fromEntries(_params.entries());
  let inner;

  const handleParams = React.useCallback(object => {
    setParams(p => new URLSearchParams({ ...Object.fromEntries(p.entries()), ...object }));
  }, [setParams]);

  if (params.type === 'quiz') {
    inner = (
      <Stack spacing={2}>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Quiz Owner</FormLabel>
          <Input autoFocus required name='username' value={params.user ?? ''} onChange={e => handleParams({ user: e.target.value })} />
          <FormHelperText>
            Only return quizzes created by this user.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Sort By</FormLabel>
          <ToggleButtonGroup value={params.sort} onChange={e => handleParams({ sort: e.target.value })}>
            <Button fullWidth variant="soft" value="totalLikes">Likes</Button>
            <Button fullWidth variant="soft" value="created">Age</Button>
            <Button fullWidth variant="soft" value="totalComments">Comments</Button>
          </ToggleButtonGroup>
          <FormHelperText>
            The type of statistic you will sort by.
          </FormHelperText>
        </FormControl>
      </Stack>
    );
  } else if (params.type === 'user') {
    inner = (
      <Stack spacing={2}>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Sort By</FormLabel>
          <ToggleButtonGroup value={params.sort} onChange={e => handleParams({ sort: e.target.value })}>
            <Button fullWidth variant="soft" value="totalFollowers">Follows</Button>
            <Button fullWidth variant="soft" value="created">Age</Button>
            <Button fullWidth variant="soft" value="totalLikes">Comments</Button>
          </ToggleButtonGroup>
          <FormHelperText>
            The type of statistic you will sort by.
          </FormHelperText>
        </FormControl>
      </Stack>
    );
  } else if (params.type === 'play') {
    inner = (
      <Stack spacing={2}>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Quiz</FormLabel>
          <Input autoFocus required name='username' value={params.quiz ?? ''} onChange={e => handleParams({ quiz: e.target.value })} />
          <FormHelperText>
            Only return plays from this quiz.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Quiz Owner</FormLabel>
          <Input autoFocus required name='username' value={params.user ?? ''} onChange={e => handleParams({ user: e.target.value })} />
          <FormHelperText>
            Only return plays created by this user.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ marginTop: "16px" }}>Sort By</FormLabel>
          <ToggleButtonGroup value={params.sort} onChange={e => handleParams({ sort: e.target.value })}>
            <Button fullWidth variant="soft" value="time">Time</Button>
            <Button fullWidth variant="soft" value="created">Age</Button>
            <Button fullWidth variant="soft" value="totalScore">Score</Button>
          </ToggleButtonGroup>
          <FormHelperText>
            The type of statistic you will sort by.
          </FormHelperText>
        </FormControl>
      </Stack>
    );
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Filter search.</DialogTitle>
        <DialogContent>Customize the {params.type} results.</DialogContent>
        {inner}
      </ModalDialog>
    </Modal>
  )
}

/*----------------------------------------------------------------------------*/

function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { width } = useWindowSize();
  const { type: _, ...rest } = Object.fromEntries(params.entries());

  const query = params.get('query') ?? '';
  const type = params.get('type') === "user" ? "user"
    : params.get('type') === "play" ? "play"
    : "quiz";

  const {
    data, error, next, doNextPage
  } = useFetchyeBatch(
    `/api/${type}?count=6&${new URLSearchParams({ ...rest, data: 'all' })}`,
    {}, 
    [params.toString(), type]
  );

  const [filterModal, setFilterModal] = React.useState(false);

  const handleTab = React.useCallback((_, value) => {
    setParams(p => new URLSearchParams({ type: value }));
  }, [setParams]);

  const handleParams = React.useCallback(object => {
    setParams(p => new URLSearchParams({ ...Object.fromEntries(p.entries()), ...object }));
  }, [setParams])

  let inner = null;

  if (data == null) {
    inner = <CircularProgress />;
  } else if (error) {
    inner = <Typography>Error: {error.error}</Typography>
  } else if (data.length === 0) {
    inner = <Typography>No results found.</Typography>;
  } else {
    inner = type === "quiz"
      ? data.map(e => <QuizItem {...e} Id={e.id} key={e.id} />)
      : data.map(e => <UserItem {...e} Id={e.id} key={e.id} />);
  }

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1} pb={10}>
      <Stack maxWidth={1024} gap={4} p={2} pb={0} mb={-0.25} overflow="scroll" boxSizing="border-box" width={1}>
        <Stack gap={2}>
          <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
            <Link underline='none' component={RouterLink} to="/" color='neutral'>
              <HomeRounded />
            </Link>
            <Typography fontSize="sm" color="primary" variant="solid">&nbsp;Explore&nbsp;</Typography>
          </Breadcrumbs>
          <Typography level="h1">Explore PicPlace.</Typography>
          <Input name='query' placeholder='Search' value={query} onChange={e => handleParams({ query: e.target.value })} startDecorator={<SearchRounded fontSize='medium' sx={{ marginLeft: -0.5 }} />}></Input>
        </Stack>
        <Stack direction="row">
          <Tabs aria-label="Icon tabs" value={type} color='neutral' sx={{ bgcolor: "transparent" }} onChange={handleTab}>
            <TabList color='neutral' disableUnderline sx={{ overflow: 'scroll' }}>
              <Tab value="quiz" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 460 || type === "quiz") ? (
                  <Typography startDecorator={<FolderRounded />}>Quizzes</Typography>
                ) : (
                  <FolderRounded />
                )}
              </Tab>
              <Tab value="user" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 460 || type === "user") ? (
                  <Typography startDecorator={<PersonRounded />}>Users</Typography>
                ) : (
                  <PersonRounded />
                )}
              </Tab>
              <Tab value="play" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 460 || type === "play") ? (
                  <Typography startDecorator={<PlayArrowRounded />}>Plays</Typography>
                ) : (
                  <PlayArrowRounded />
                )}
              </Tab>
            </TabList>
          </Tabs>
          <div style={{ flex: 1 }} />
          <Button color='success' variant="solid" sx={{ borderRadius: "8px 8px 0px 0px" }} startDecorator={<TuneRounded />} onClick={() => setFilterModal(true)}>Filter</Button>
        </Stack>
      </Stack>
      <Divider orientation='horizontal' inset='context' />
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" width={1} py={4} flexWrap="wrap" direction="row">
        {inner}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }} />
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }} />
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }} />
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }} />
      </Stack>
      { next &&
        <Button onClick={doNextPage}>Click for more results.</Button>
      }
      <ExploreFilterModal open={filterModal} setOpen={setFilterModal} />
    </Stack>
  );
}

export default ExplorePage;
