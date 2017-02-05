
const Buffers = require('Buffers')
const hex = (s) => Buffer.from(s, 'hex')
const vint = require('./vint.js')

const tags = {}
for (let [name, { id, type, length, children }] of Object.entries(require('./tags.json'))) {
  // clone, but convert the id to a pre-made buffer
  tags[name] = { id: vint.write(id), type, length, children }
}

module.exports = function (tag, ebml) {
  return walk(tag, ebml).toBuffer()
}

module.exports.steaming = function (tag, ebml) {
  const buffs = walk(tag, ebml)
  buffs.buffers[1] = hex('1fffffff') // set unknown length
  return buffs.toBuffer()
}

function walk (tag, obj) {
  if (!tags[tag]) console.log(tag, 'missing!')
  tag = tags[tag]

  if (Array.isArray(obj)) {
    return readArray(tag, obj)
  }

  if (typeof obj !== 'object') {
    return createTag(tag, obj)
  }

  return readObject(tag, obj)
}

function encapsulate (id, value, min) {
  return Buffers([id, vint.write(value.length, min), value])
}

function createTag (tag, value) {
  switch (tag.type) {
    case 'd':// date
      if (Object.prototype.toString.call(value) === '[object Date]') {
        value = (value.valueOf() + 978307200000) * 1000
      }
    /* falls through */
    case 'u': // unsigned int
    case 'i': // signed integer
    case 'f': // float
      value = value.toString(16)
      if (value.length % 2 !== 0) value = '0' + value
    /* falls through */
    case 'b':// binary
      return encapsulate(tag.id, hex(value), tag.length)

    case 's': // string
      return encapsulate(tag.id, Buffer.from(value, 'ascii'), tag.length)
    case '8':// UTF-8 string
      return encapsulate(tag.id, Buffer.from(value, 'utf8'), tag.length)
    default:
      throw new Error('Tag Not Implemented:' + tag.type)
  }
}

function readObject (tag, obj) {
  const children = []
  for (var [subkey, value] of Object.entries(obj)) {
    children.push(walk(subkey, value))
  }
  return encapsulate(tag.id, Buffers(children), tag.length)
}

function readArray (parent, arr) {
  var tag = tags[parent.children]
  var elements = arr.map((obj) => readObject(tag, obj))
  return encapsulate(parent.id, Buffers(elements), parent.length)
}
