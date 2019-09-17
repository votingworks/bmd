const fs = require('fs');
const jpeg = require('jpeg-js')

const jpegData = fs.readFileSync('/Users/donovan/src/votingworks/module-scan/sample-ballot-images/sample-batch-1-ballot-1.jpg')
const imageData = jpeg.decode(jpegData, { useTArray: true })
const imgByteArray = Uint8ClampedArray.from(imageData.data)
const imgWidth = imageData.width;
const imgHeight = imageData.height;

console.log({ imgWidth, imgHeight })
const { RGBLuminanceSource, BinaryBitmap, HybridBinarizer, QRCodeReader } = require('@zxing/library/esm5'); // use this path since v0.5.1

const reader = new QRCodeReader();

const luminanceSource = new RGBLuminanceSource(imgWidth, imgHeight, imgByteArray);
const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

reader.decode(binaryBitmap);
