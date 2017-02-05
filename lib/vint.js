
exports.write = function (value, length = 1) {
  if (value < 0) throw new Error('VInt cannot be negative')

  // JavaScript COULD go up to 53 bits- but
  // writeUIntBE is limited to 48... which covers most needs
  if (value > 0xFFFFFFFFFFFF) return Buffer.from('1fffffff', 'hex') // unknownlength

  // determine the overall length
  for (length = length || 1; length <= 8 && !(value < Math.pow(2, 7 * length) - 1); length++);

  const buff = new Buffer(length)
  buff.writeUIntBE(value, 0, length)
  // write the marker
  buff[0] |= 1 << (8 - length)
  return buff
}

exports.read = function read (buf, start = 0) {
  const first = buf[start]
  // search for the first `1` from the left
  const length = getSize(first)
  if (!length || length >= 6) {
    throw new Error('lengths greater than 48 bits are not supported')
  }

  buf[start] = first & ~(0x100 >> length) // remove the mark
  return buf.readUIntBE(start, length)
}

exports.getSize = getSize

function getSize (byte) {
  // search for the first `1` from the left
  for (var l = 1, mask = 0x80; l < 8 && !(byte & mask); l++, mask >>= 1);
  return l === 8 ? undefined : l
}
