const sharp = require('sharp');
const ssim = require('ssim');
const fs = require('fs');

const { createImageData } = require('canvas');

async function prepareImageData(imagePath, targetWidth, targetHeight) {
  const buffer = await sharp(`public/${imagePath}`)
    .resize(targetWidth, targetHeight)
    .toBuffer();

  // console.log('getting canvas set up');

  const image = await sharp(buffer)
    .extract({
      left: 0, top: 0, width: targetWidth, height: targetHeight,
    })
    .greyscale()
    .toColorspace('b-w')
    .raw()
    .toBuffer();

  // console.log('Buffer length:', image.length);
  // console.log('Expected length:', targetWidth * targetHeight * 4);

  const rgbaBuffer = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  for (let i = 0, j = 0; i < rgbaBuffer.length; i += 4, j += 1) {
    rgbaBuffer[i] = rgbaBuffer[i + 1] = rgbaBuffer[i + 2] = image[j];
    rgbaBuffer[i + 3] = 255; // Full opacity
  }

  const imageData = createImageData(rgbaBuffer, targetWidth, targetHeight);
  return imageData;
}

// OG COMPARE IMAGES PASSED TEST CASES

const compareImages = async (userImagePath, answerImagePath) => {
  // console.log('user image path and answer ima', userImagePath, answerImagePath);
  // console.log('about to compare 2 images');

  const {
    width: answerWidth,
    height: answerHeight,
  } = await sharp(`public${answerImagePath}`).metadata();

  // console.log('here!');
  const userImage = (
    await prepareImageData(userImagePath, answerWidth, answerHeight)
  );
  // console.log('here!');

  const answerImageProcessed = (
    await prepareImageData(answerImagePath, answerWidth, answerHeight)
  );
  // console.log('here!');

  const userPixels = new Uint8Array(userImage.data);
  const answerPixels = new Uint8Array(answerImageProcessed.data);

  return ssim(userPixels, answerPixels);
};
const checkFileExists = (filePath) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', filePath);
    } else {
      console.log('File exists:', filePath);
    }
  });
};

module.exports = { prepareImageData, compareImages };
