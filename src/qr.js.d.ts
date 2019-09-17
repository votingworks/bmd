declare module 'qr.js/lib/QRCode' {
  import ErrorCorrectLevel = require('qr.js/lib/ErrorCorrectLevel')
  import Mode = require('qr.js/lib/mode')
  import BitBuffer = require('qr.js/lib/BitBuffer')

  interface DataChunk {
    mode: Mode
    getLength(): number
    write(buffer: BitBuffer): void
  }

  class QRCode {
    public constructor(typeNumber: number, errorCorrectLevel: ErrorCorrectLevel)

    public modules: number[][] | null
    public moduleCount: number
    public dataCache: null
    public dataList: DataChunk[]

    public make(): void
  }

  export = QRCode
}

declare module 'qr.js/lib/ErrorCorrectLevel' {
  enum ErrorCorrectLevel {
    L = 1,
    M = 0,
    Q = 3,
    H = 2,
  }

  export = ErrorCorrectLevel
}

declare module 'qr.js/lib/mode' {
  enum Mode {
    MODE_NUMBER = 1 << 0,
    MODE_ALPHA_NUM = 1 << 1,
    MODE_8BIT_BYTE = 1 << 2,
    MODE_KANJI = 1 << 3,
  }

  export = Mode
}

declare module 'qr.js/lib/BitBuffer' {
  class BitBuffer {
    public put(number: number, length: number): void
  }

  export = BitBuffer
}
