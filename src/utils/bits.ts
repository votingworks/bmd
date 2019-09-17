import { TextEncoder, TextDecoder } from 'text-encoding'

export type Uint8Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Uint1 = 0 | 1
export type Uint8 =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99
  | 100
  | 101
  | 102
  | 103
  | 104
  | 105
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118
  | 119
  | 120
  | 121
  | 122
  | 123
  | 124
  | 125
  | 126
  | 127
  | 128
  | 129
  | 130
  | 131
  | 132
  | 133
  | 134
  | 135
  | 136
  | 137
  | 138
  | 139
  | 140
  | 141
  | 142
  | 143
  | 144
  | 145
  | 146
  | 147
  | 148
  | 149
  | 150
  | 151
  | 152
  | 153
  | 154
  | 155
  | 156
  | 157
  | 158
  | 159
  | 160
  | 161
  | 162
  | 163
  | 164
  | 165
  | 166
  | 167
  | 168
  | 169
  | 170
  | 171
  | 172
  | 173
  | 174
  | 175
  | 176
  | 177
  | 178
  | 179
  | 180
  | 181
  | 182
  | 183
  | 184
  | 185
  | 186
  | 187
  | 188
  | 189
  | 190
  | 191
  | 192
  | 193
  | 194
  | 195
  | 196
  | 197
  | 198
  | 199
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 209
  | 210
  | 211
  | 212
  | 213
  | 214
  | 215
  | 216
  | 217
  | 218
  | 219
  | 220
  | 221
  | 222
  | 223
  | 224
  | 225
  | 226
  | 227
  | 228
  | 229
  | 230
  | 231
  | 232
  | 233
  | 234
  | 235
  | 236
  | 237
  | 238
  | 239
  | 240
  | 241
  | 242
  | 243
  | 244
  | 245
  | 246
  | 247
  | 248
  | 249
  | 250
  | 251
  | 252
  | 253
  | 254
  | 255

export const Uint8Size = 8

/**
 * Generates a series of bitmasks in little-endian order.
 *
 * @example
 * 
 * makeMasks(0) // []
 * makeMasks(1) // [0b1]
 * makeMasks(2) // [0b10, 0b01]
 * makeMasks(3) // [0b100, 0b010, 0b001]
 */
function makeMasks<T extends number>(count: number): T[] {
  const results: T[] = []

  for (let i = count - 1; i >= 0; i--) {
    results.push((1 << i) as T)
  }

  return results
}

export class BitCursor {
  private offset = 0

  public next(): void {
    this.offset += 1
  }

  public prev(): void {
    this.offset -= 1
  }

  public get isByteStart(): boolean {
    return this.offset % Uint8Size === 0
  }

  public get bitOffset(): Uint8Index {
    return (this.offset % Uint8Size) as Uint8Index
  }

  public get byteOffset(): number {
    return (this.offset - this.bitOffset) / Uint8Size
  }

  public mask(bit: Uint1 = 1): Uint8 {
    return bit ? BitCursor.uint8Masks[this.bitOffset] : 0
  }

  public static uint8Masks: readonly Uint8[] = makeMasks(Uint8Size)
}

/**
 * Coerces `number` to a `Uint8` by asserting it is in the range of `Uint8`.
 *
 * @throws if `number` is outside the range of `Uint8` or is not an integer
 */
export function toUint8(number: number): Uint8 {
  if (number < 0x00 || number > 0xff || (number | 0) !== number) {
    throw new TypeError(`cannot convert number to Uint8: ${number}`)
  }
  return number as Uint8
}

/**
 * Gets the size in bits of a number.
 * 
 * @param number a non-negative integer
 * @returns the minimum number of bits required to represent `number`
 * @throws if `number` is negative or is not an integer
 */
export function sizeof(number: number): number {
  if (number < 0 || (number | 0) !== number) {
    throw new TypeError(`cannot get size of negative or non-integer: ${number}`)
  }

  let maxBits = 1

  // eslint-disable-next-line no-cond-assign
  while ((number >>= 1)) {
    maxBits += 1
  }

  return maxBits
}

/**
 * Encoding to be used for encoding and decoding text.
 *
 * @see `BitWriter#writeString`
 * @see `BitReader#readString`
 */
export interface Encoding {
  readonly bitsPerElement: number
  encode(string: string): Uint8Array
  decode(data: Uint8Array): string
}

/**
 * Default encoding to use for `BitReader` and `BitWriter`.
 */
export const UTF8Encoding: Encoding = {
  bitsPerElement: Uint8Size,

  /**
   * Encodes a string as UTF-8 code points.
   */
  encode(string: string): Uint8Array {
    return new TextEncoder('utf-8').encode(string)
  },

  /**
   * Decodes a string from UTF-8 code points.
   */
  decode(data: Uint8Array): string {
    return new TextDecoder('utf-8').decode(data)
  },
}

/**
 * Encoding based on a string of representable characters. Each character is
 * represented by its index within the string, and any other characters are
 * unrepresentable.
 *
 * @example
 *
 * const encoding = new CustomEncoding('0123456789')
 * encoding.encode('23')  // Uint8Array [2, 3]
 */
export class CustomEncoding implements Encoding {
  private readonly chars: string

  /**
   * The maximum character code representable by this class.
   */
  public static MAX_CODE = 1 << (Uint8Array.BYTES_PER_ELEMENT * Uint8Size) - 1
  public readonly bitsPerElement: number

  /**
   * @param chars a string of representable characters without duplicates
   */
  public constructor(chars: string) {
    this.validateChars(chars)
    this.chars = chars
    this.bitsPerElement = sizeof(chars.length - 1)
  }

  private validateChars(chars: string): void {
    if (chars.length > CustomEncoding.MAX_CODE + 1) {
      throw new Error(
        `character set too large, has ${chars.length} but only ${CustomEncoding.MAX_CODE + 1} are allowed`
      )
    }

    for (let i = 0; i < chars.length - 1; i++) {
      const duplicateIndex = chars.indexOf(chars.charAt(i), i + 1)
      if (duplicateIndex > 0) {
        throw new Error(`duplicate character found in character set:\n- set: ${JSON.stringify(chars)}\n- duplicates: ${i} & ${duplicateIndex}`)
      }
    }
  }

  /**
   * Encodes `string` as a series of character codes based on the character set
   * provided to the constructor.
   *
   * @param string a string containing only representable characters
   */
  public encode(string: string): Uint8Array {
    const codes = new Uint8Array(string.length)

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i)
      const code = this.chars.indexOf(char)

      if (code < 0) {
        throw new Error(`cannot encode unrepresentable character: ${JSON.stringify(char)} (allowed: ${JSON.stringify(this.chars)})`)
      }

      codes.set([code], i)
    }

    return codes
  }

  /**
   * Builds a string by decoding a character from each character code based on
   * the character set provided to the constructor.
   *
   * @param data a series of character codes representing characters in this encoding
   */
  public decode(data: Uint8Array): string {
    return Array.from(data)
      .map((code, i) => {
        if (code >= this.chars.length) {
          throw new Error(`character code out of bounds at index ${i}: ${code}`)
        }

        return this.chars[code]
      })
      .join('')
  }
}

/**
 * Writes structured data into a `Uint8Array`. Data is written in little-endian
 * order.
 */
export class BitWriter {
  private data = new Uint8Array()
  private cursor = new BitCursor()
  private nextByte: Uint8 = 0b00000000

  /**
   * Writes a single bit.
   */
  public writeUint1(uint1: Uint1): this {
    const mask = this.cursor.mask(uint1)
    this.nextByte |= mask
    this.cursor.next()

    if (this.cursor.isByteStart) {
      this.data = Uint8Array.of(...Array.from(this.data), this.nextByte)
      this.nextByte = 0b00000000
    }

    return this
  }

  /**
   * Writes `1` if given `true`, `0` otherwise.
   */
  public writeBoolean(boolean: boolean): this {
    return this.writeUint1(boolean ? 1 : 0)
  }

  /**
   * Writes data from a `Uint8` by writing 8 bits.
   */
  public writeUint8(uint8: Uint8): this {
    return this.writeUint(uint8, { size: Uint8Size })
  }

  /**
   * Writes an unsigned integer as a series of bits. There are two ways to
   * control the number of bytes `number` takes: provide a `max` value or
   * provide a `size`. If `max` is provided, then however many bytes would be
   * required to write `max` will be used to write `number`. If `size` is
   * provided, then that is how many bytes will be used.
   *
   * @example
   *
   * bits.writeUint(23, { max: 30 })  // writes `10111`
   * bits.writeUint(99, { size: 8 })  // writes `01100011`
   */
  public writeUint(
    number: number,
    { max, size }: { max?: number; size?: number } = {}
  ): this {
    if (typeof max !== 'undefined' && typeof size !== 'undefined') {
      throw new Error("cannot specify both 'max' and 'size' options")
    }

    if (typeof max !== 'undefined') {
      if (number > max) {
        throw new Error(`overflow: ${number} must be less than ${max}`)
      }

      size = sizeof(max)
    }

    if (typeof size === 'undefined') {
      throw new Error('size cannot be undefined')
    }

    if (number >= 1 << size) {
      throw new Error(`overflow: ${number} cannot fit in ${size} bits`)
    }

    for (const mask of makeMasks(size)) {
      this.writeUint1((number & mask) === 0 ? 0 : 1)
    }

    return this
  }

  /**
   * Writes string data with an encoding and maximum length. By default, the
   * encoding used will be UTF-8. If your string has a restricted character set,
   * you can use your own `CustomEncoding` to read and write the string more
   * compactly than you otherwise would be able to.
   * 
   * It is important to remember that the `encoding` and `maxLength` options
   * must be the same for `readString` and `writeString` calls, otherwise
   * reading the string will very likely fail or be corrupt.
   *
   * @example
   *
   * bits.writeString('hi') // uses utf-8, writes '0110100001101001'
   *
   * const encoding = new CustomEncoding('hi')
   * bits.writeString('hi') // uses custom encoding, writes '01'
   */
  public writeString(
    string: string,
    {
      encoding = UTF8Encoding,
      maxLength = 255,
    }: { encoding?: Encoding; maxLength?: number } = {}
  ): this {
    const codes = Array.from(encoding.encode(string))

    if (codes.length > maxLength) {
      throw new Error(
        `overflow: cannot write a string longer than max length: ${string.length} > ${maxLength}`
      )
    }

    // write length
    this.writeUint(codes.length, { max: maxLength })

    // write content
    for (const code of codes) {
      this.writeUint(code, { size: encoding.bitsPerElement })
    }

    return this
  }

  /**
   * Converts the data written to this `BitWriter` to a `Uint8Array`.
   */
  public toUint8Array(): Uint8Array {
    const pendingByte = this.getPendingByte()
    return Uint8Array.of(
      ...Array.from(this.data),
      ...(typeof pendingByte !== 'undefined' ? [pendingByte] : [])
    )
  }

  /**
   * If there's a byte that is not yet full, get it.
   */
  private getPendingByte(): Uint8 | undefined {
    if (!this.cursor.isByteStart) {
      return this.nextByte
    }
  }
}

/**
 * Reads structured data from a `Uint8Array`. Data is read in little-endian
 * order.
 */
export class BitReader {
  private data: Uint8Array
  private cursor = new BitCursor()

  /**
   * @param data a buffer to read data from
   */
  public constructor(data: Uint8Array) {
    this.data = data
  }

  /**
   * Reads a Uint1 and moves the internal cursor forward one bit.
   */
  public readUint1(): Uint1 {
    const byte = this.getCurrentByte()
    const mask = this.cursor.mask()

    this.cursor.next()

    return (byte & mask) === 0 ? 0 : 1
  }

  /**
   * Reads a number by reading 8 bits.
   */
  public readUint8(): Uint8 {
    return this.readUint({ size: Uint8Size }) as Uint8
  }

  /**
   * Reads a boolean by reading a bit and returning whether the bit was set.
   */
  public readBoolean(): boolean {
    return this.readUint1() === 1
  }

  /**
   * Reads a unsigned integer as a series of bits. There are two ways to control
   * the number of bytes `number` takes: provide a `max` value or provide a
   * `size`. If `max` is provided, then however many bytes would be required to
   * write `max` will be used to write `number`. If `size` is provided, then
   * that is how many bytes will be used.
   *
   * @example
   *
   * // contains 16 bits
   * const bits = new BitReader(Uint8Array.of(0xff, 0x0f))
   *
   * bits.readUint({ max: 0x0f })  // reads first 4 bits: 0x0f
   * bits.readUint({ size: 8 })    // reads next 8 bits:  0xf0
   * bits.readUint({ size: 4 })    // reads last 4 bits:  0x0f
   */
  public readUint({max, size }: { max?: number, size?: number } = {}): number {
    if (typeof max !== 'undefined' && typeof size !== 'undefined') {
      throw new Error("cannot specify both 'max' and 'size' options")
    }

    if (typeof max !== 'undefined') {
      size = sizeof(max)
    }

    if (typeof size === 'undefined') {
      throw new Error('size cannot be undefined')
    }

    let result = 0

    for (const mask of makeMasks(size)) {
      const bit = this.readUint1()
      if (bit) {
        result |= mask
      }
    }

    return result
  }

  /**
   * Reads a length-prefixed string with an encoding and maximum length. By
   * default, the encoding used will be UTF-8. If your string has a restricted
   * character set, you can use your own `CustomEncoding` to read and write the
   * string more compactly than you otherwise would be able to.
   *
   * It is important to remember that the `encoding` and `maxLength` options
   * must be the same for `readString` and `writeString` calls, otherwise
   * reading the string will very likely fail or be corrupt.
   *
   * @example
   *
   *                                  // length  'h'  'i'
   *                                  //      ↓   ↓    ↓
   * const bits = new BitReader(Uint8Array.of(2, 104, 105))
   * bits.readString() // "hi"
   *
   *                                  // length  'h''i'
   *                                  //           ↓↓
   * const bits = new BitReader(Uint8Array.of(2, 0b01000000))
   * const encoding = new CustomEncoding('hi')    // ↑↑↑↑↑↑
   * bits.readString() // "hi"                       padding
   */
  public readString({
    encoding = UTF8Encoding,
    maxLength = 255,
  }: { encoding?: Encoding, maxLength?: number } = {}): string {
    const length = this.readUint({ max: maxLength })
    const codes = new Uint8Array(length)

    for (let i = 0; i < length; i++) {
      codes.set([this.readUint({ size: encoding.bitsPerElement })], i)
    }

    return encoding.decode(codes)
  }

  /**
   * Determines whether there is any more data to read. If the result is
   * `false`, then any call to read data will throw an exception.
   */
  public canRead(): boolean {
    return this.cursor.byteOffset < this.data.length
  }

  private getCurrentByte(): Uint8 {
    if (this.cursor.byteOffset >= this.data.length) {
      throw new Error(
        `end of buffer reached: byteOffset=${this.cursor.byteOffset} bitOffset=${this.cursor.bitOffset} data.length=${this.data.length}`
      )
    }

    return toUint8(this.data[this.cursor.byteOffset])
  }
}
