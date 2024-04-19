import React, { useState } from 'react';
import { Avatar, Button } from '@mui/joy';

const ImageInput = ({ src, alt, onImageChange }) => {
  const [preview, setPreview] = useState(src);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  return (
    <div>
      <Avatar src={preview} alt={alt || 'Profile Picture'} sx={{ width: 90, height: 90 }} />
      <Button component="label">
        Upload Picture
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleChange}
        />
      </Button>
    </div>
  );
};

export default ImageInput;
