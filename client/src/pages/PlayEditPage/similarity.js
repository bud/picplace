import ssim from "ssim.js";

// Function to compute histogram of an image
function computeHistogram(imageData) {
  let histogram = new Array(256).fill(0);
  for (let i = 0; i < imageData.data.length; i += 4) {
      let intensity = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      histogram[intensity]++;
  }
  return histogram;
}

// Function to compute cumulative distribution function (CDF) from histogram
function computeCDF(histogram) {
  let cdf = [];
  cdf[0] = histogram[0];
  for (let i = 1; i < histogram.length; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
  }
  return cdf;
}

// Function to perform histogram stretching
export function stretchHistogram(imageData) {
  let histogram = computeHistogram(imageData);
  let cdf = computeCDF(histogram);

  // Find minimum and maximum non-zero CDF values
  let cdfMin = cdf.find(value => value !== 0);
  let cdfMax = cdf[cdf.length - 1];

  // Stretch histogram
  for (let i = 0; i < imageData.data.length; i += 4) {
      let intensity = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      let newValue = Math.round(((cdf[intensity] - cdfMin) / (cdfMax - cdfMin)) * 255);
      imageData.data[i] = newValue; // Red channel
      imageData.data[i + 1] = newValue; // Green channel
      imageData.data[i + 2] = newValue; // Blue channel
  }
}

// Function to perform histogram normalization
export function normalizeHistogram(imageData) {
  let histogram = computeHistogram(imageData);
  let cdf = computeCDF(histogram);

  // Normalize histogram
  let totalPixels = imageData.width * imageData.height;
  for (let i = 0; i < imageData.data.length; i += 4) {
      let intensity = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      let newValue = Math.round((cdf[intensity] / totalPixels) * 255);
      imageData.data[i] = newValue; // Red channel
      imageData.data[i + 1] = newValue; // Green channel
      imageData.data[i + 2] = newValue; // Blue channel
  }
}

export function getCenterCrop(outer, inner) {
  if (outer == null || inner == null) return [0, 0, 0, 0];
    let [w, h] = [inner.width, inner.height];
    const scale = Math.min(outer.width / w, outer.height / h);
    w = w * scale;
    h = h * scale;
    const x = (outer.width - w) / 2;
    const y = (outer.height - h) / 2;
    return [x, y, w, h];
}

export function calculateScore(a, b) {
  if (a == null || b == null) return 0;
  const [width, height] = [100, Math.floor((a.height * 100) / a.width)];
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(a, 0, 0, a.width, a.height, 0, 0, width, height);
  const a_data = ctx.getImageData(0, 0, width, height);
  normalizeHistogram(a_data);
  stretchHistogram(a_data);
  
  const [x, y, w, h] = getCenterCrop(b, { width, height });
  ctx.drawImage(b, x, y, w, h, 0, 0, width, height);
  const b_data = ctx.getImageData(0, 0, width, height);
  normalizeHistogram(b_data);
  stretchHistogram(b_data);
  
  const scores = ssim(a_data, b_data);
  return Math.max(0, Math.min(1, 2 * scores.mssim));
}