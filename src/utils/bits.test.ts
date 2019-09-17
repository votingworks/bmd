import { BitReader, BitWriter, CustomEncoding } from './bits'

test('can write a bit', () => {
  expect(new BitWriter().writeUint1(1).toUint8Array()).toEqual(
    Uint8Array.of(0b10000000)
  )
})

test('can write multiple bits', () => {
  expect(
    new BitWriter()
      .writeUint1(1)
      .writeUint1(0)
      .writeUint1(1)
      .toUint8Array()
  ).toEqual(Uint8Array.of(0b10100000))
})

test('can write a byte', () => {
  expect(new BitWriter().writeUint8(0b10101010).toUint8Array()).toEqual(
    Uint8Array.of(0b10101010)
  )
})

test('can write multiple bytes', () => {
  expect(
    new BitWriter()
      .writeUint8(0b00010110)
      .writeUint8(0b11110000)
      .toUint8Array()
  ).toEqual(Uint8Array.of(0b00010110, 0b11110000))
})

test('can write a non-aligned byte after writing a bit', () => {
  expect(
    new BitWriter()
      .writeUint1(1)
      .writeUint8(0b00001110)
      .toUint8Array()
  ).toEqual(Uint8Array.of(0b10000111, 0b00000000))
})

test('can write a utf-8 string', () => {
  expect(new BitWriter().writeString('abcdé').toUint8Array()).toEqual(
    Uint8Array.of(
      6,
      0b01100001,
      0b01100010,
      0b01100011,
      0b01100100,
      0b11000011,
      0b10101001
    )
  )
})

test('can write a non-aligned utf-8 string after writing a bit', () => {
  expect(
    new BitWriter()
      .writeUint1(1)
      .writeString('abc')
      .toUint8Array()
  ).toEqual(
    Uint8Array.of(0b10000001, 0b10110000, 0b10110001, 0b00110001, 0b10000000)
  )
})

test('can write a string with a custom character set', () => {
  const encoding = new CustomEncoding('abcdefghijklmnopqrstuvwxyz')
  expect(
    new BitWriter().writeString('abc', { encoding }).toUint8Array()
  ).toEqual(Uint8Array.of(0b00000011, 0b00000000, 0b01000100))
})

test('fails to write a string that is longer than the maximum length', () => {
  expect(() => new BitWriter().writeString('a', { maxLength: 0 })).toThrowError(
    'overflow: cannot write a string longer than max length: 1 > 0'
  )
})

test('fails to encode a string containing characters not in a custom encoding', () => {
  const encoding = new CustomEncoding('abc')
  expect(() => encoding.encode('d')).toThrowError('cannot encode unrepresentable character: "d" (allowed: "abc")')
})

test('fails to decode a string when the character codes are out of bounds', () => {
  const encoding = new CustomEncoding('abc')
  expect(() => encoding.decode(Uint8Array.of(3))).toThrowError('character code out of bounds at index 0: 3')
})

test('can read uints with various options', () => {
   const bits = new BitReader(Uint8Array.of(0xff, 0x0f))
   
   expect(bits.readUint({ max: 0x0f })).toEqual(0x0f)
   expect(bits.readUint({ size: 8 })).toEqual(0xf0)
   expect(bits.readUint({ size: 4 })).toEqual(0x0f)
})

test('can round-trip a bit', () => {
  expect(
    new BitReader(new BitWriter().writeUint1(1).toUint8Array()).readUint1()
  ).toEqual(1)
})

test('can round-trip a byte', () => {
  expect(
    new BitReader(new BitWriter().writeUint8(127).toUint8Array()).readUint8()
  ).toEqual(127)
})

test('can round-trip a utf-8 string', () => {
  expect(
    new BitReader(
      new BitWriter().writeString('abc').toUint8Array()
    ).readString()
  ).toEqual('abc')
})

test('can round-trip a utf-8 emoji string', () => {
  expect(
    new BitReader(
      new BitWriter().writeString('✓ 😊').toUint8Array()
    ).readString()
  ).toEqual('✓ 😊')
})

test('can round-trip a non-aligned utf-8 emoji string', () => {
  const reader = new BitReader(
    new BitWriter()
      .writeUint1(0)
      .writeString('🌈')
      .toUint8Array()
  )

  expect(reader.readUint1()).toEqual(0)
  expect(reader.readString()).toEqual('🌈')
})

test('can round-trip a string with a custom encoding', () => {
  const encoding = new CustomEncoding('0123456789')
  const reader = new BitReader(
    new BitWriter().writeString('19', { encoding }).toUint8Array()
  )

  expect(reader.readString({ encoding })).toEqual('19')
})

test('can round-trip a string with a custom maximum length', () => {
  expect(
    new BitReader(
      new BitWriter().writeString('a', { maxLength: 2 }).toUint8Array()
    ).readString({ maxLength: 2 })
  ).toEqual('a')
})
