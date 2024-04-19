import { Button, IconButton } from '@mui/joy';
import { useWindowSize } from '@uidotdev/usehooks'
import React from 'react'

function RespButton({ breakpoint, icon: Icon, label, ...rest }) {
  const { width } = useWindowSize();
  return width > 500 ? (
    <Button startDecorator={<Icon />} {...rest}>{label}</Button>
  ) : (
    <IconButton {...rest}><Icon /></IconButton>
  );
}

export default React.memo(RespButton);