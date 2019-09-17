const jpeg = require("jpeg-js");
const { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = require('@zxing/library/esm5');
const fs = require('fs');
const { promisify } = require("util");

async function scanQR(data) {
  const rawImageData = jpeg.decode(data);

  const hints = new Map();
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX];
      
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
      
  const reader = new MultiFormatReader();
      
  reader.setHints(hints);
  
  const len = rawImageData.width * rawImageData.height;
  
  const luminancesUint8Array = new Uint8ClampedArray(len);
  
  for(let i = 0; i < len; i++){
    luminancesUint8Array[i] = ((rawImageData.data[i*4]+rawImageData.data[i*4+1]*2+rawImageData.data[i*4+2]) / 4) & 0xFF;
  }
  
  const luminanceSource = new RGBLuminanceSource(luminancesUint8Array, rawImageData.width, rawImageData.height);
  
  console.log(luminanceSource)
  
  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
  
  
  const qrCode = reader.decode(binaryBitmap);
  
  console.log(qrCode);

  if (qrCode) {
    return JSON.parse(qrCode.getText());
  } else {
    console.error("failed to decode qr code.");
  }
}

async function main() {
  const data = await promisify(fs.readFile)(process.argv[2], {});
  console.log(data)

  console.log(await scanQR(data))
}

main().catch(error => console.error(error))