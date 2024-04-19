import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Tabs, Tab, Stack, Breadcrumbs, TabList, Divider, CircularProgress, Input, Modal, DialogContent, DialogTitle, ModalDialog, Button, FormControl, FormLabel, FormHelperText, IconButton } from '@mui/joy';
import { ChevronRightRounded, CommentRounded, FolderRounded, GridViewRounded, HomeRounded, PersonRounded, PlayArrowRounded, SearchRounded, TuneRounded } from '@mui/icons-material';
import { Link } from '@mui/joy';
import { Link as RouterLink } from 'react-router-dom';
import useFetchyeBatch from '../util/useFetchyeBatch';
import { useWindowSize } from '@uidotdev/usehooks';
import ReportItem from '../util/ReportItem';
import { useAuth } from '../util/UserContext';
import RestrictedPage from './RestrictedPage';

/*----------------------------------------------------------------------------*/

function ReportFilterModal({ open, setOpen }) {
  const [_params, setParams] = useSearchParams();
  const params = Object.fromEntries(_params.entries());

  const handleParams = React.useCallback(object => {
    setParams(p => new URLSearchParams({ ...Object.fromEntries(p.entries()), ...object }));
  }, [setParams]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{ p: 3, width: 400 }}>
        <DialogTitle level='h1'>Filter search.</DialogTitle>
        <DialogContent>Customize the {params.type} results.</DialogContent>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel sx={{ marginTop: "16px" }}>Reporter ID</FormLabel>
            <Input autoFocus required name='username' value={params.user ?? ''} onChange={e => handleParams({ reporter: e.target.value })} />
            <FormHelperText>
              Only reports created by this user.
            </FormHelperText>
          </FormControl>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}

/*----------------------------------------------------------------------------*/

const VALID_TYPES = ['user', 'comment', 'play', 'quiz'];

function ReportPage() {
  const [user] = useAuth();
  const [params, setParams] = useSearchParams();
  const { width } = useWindowSize();
  const { type: _, ...rest } = Object.fromEntries(params.entries());

  const query = params.get('query') ?? '';
  const type = VALID_TYPES.includes(params.get('type')) ? params.get('type') : '';

  const {
    data, error, next, doNextPage
  } = useFetchyeBatch(
    `/api/report?type=${type}&count=6&${new URLSearchParams({ ...rest, data: 'all' })}`,
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

  if (!user?.admin) {
    return <RestrictedPage />
  } else if (data == null) {
    inner = <CircularProgress />;
  } else if (error) {
    inner = <Typography>Error: {error.error}</Typography>
  } else if (data.length === 0) {
    inner = <Typography>No {type} reports found.</Typography>;
  } else {
    inner = data.map(e => <ReportItem {...e} Id={e.id} key={e.id} />);
  }

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1} pb={10}>
      <Stack maxWidth={1024} gap={4} p={2} pb={0} mb={-0.25} overflow="scroll" boxSizing="border-box" width={1}>
        <Stack gap={2}>
          <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
            <Link underline='none' component={RouterLink} to="/" color='neutral'>
              <HomeRounded />
            </Link>
            <Typography fontSize="sm" color="primary" variant="solid">&nbsp;Report&nbsp;</Typography>
          </Breadcrumbs>
          <Typography level="h1">View Reports.</Typography>
          <Input name='query' placeholder='Search' value={query} onChange={e => handleParams({ query: e.target.value })} startDecorator={<SearchRounded fontSize='medium' sx={{ marginLeft: -0.5 }} />}></Input>
        </Stack>
        <Stack direction="row">
          <Tabs aria-label="Icon tabs" value={type} color='neutral' sx={{ bgcolor: "transparent" }} onChange={handleTab}>
            <TabList color='neutral' disableUnderline sx={{ overflow: 'scroll' }}>
              <Tab value="" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 700) ? (
                  <Typography startDecorator={<GridViewRounded />}>All</Typography>
                ) : (
                  <GridViewRounded />
                )}
              </Tab>
              <Tab value="quiz" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 700) ? (
                  <Typography startDecorator={<FolderRounded />}>Quizzes</Typography>
                ) : (
                  <FolderRounded />
                )}
              </Tab>
              <Tab value="user" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 700) ? (
                  <Typography startDecorator={<PersonRounded />}>Users</Typography>
                ) : (
                  <PersonRounded />
                )}
              </Tab>
              <Tab value="play" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 700) ? (
                  <Typography startDecorator={<PlayArrowRounded />}>Plays</Typography>
                ) : (
                  <PlayArrowRounded />
                )}
              </Tab>
              <Tab value="comment" sx={{ flexShrink: 0, borderRadius: "8px 8px 0px 0px" }}>
                {(width > 700) ? (
                  <Typography startDecorator={<CommentRounded />}>Comments</Typography>
                ) : (
                  <CommentRounded />
                )}
              </Tab>
            </TabList>
          </Tabs>
          <div style={{ flex: 1 }} />
          { width > 400 ? (
            <Button color='danger' variant="solid" sx={{ borderRadius: "8px 8px 0px 0px" }} startDecorator={<TuneRounded />} onClick={() => setFilterModal(true)}>Filter</Button>
          ) : (
            <IconButton color='danger' variant="solid" sx={{ borderRadius: "8px 8px 0px 0px" }} onClick={() => setFilterModal(true)}><TuneRounded /></IconButton>
          )}
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
      <ReportFilterModal open={filterModal} setOpen={setFilterModal} />
    </Stack>
  );
}

export default ReportPage;
