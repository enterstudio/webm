
const webm = require('./webm.js')
const encode = webm.encode

var ebml = encode('EBML', {
  EBMLVersion: 1,
  EBMLReadVersion: 1,
  EBMLMaxIDLength: 4,
  EBMLMaxSizeLength: 8,
  DocType: 'webm',
  DocTypeVersion: 2,
  DocTypeReadVersion: 2
})

console.log(ebml)

var segment = encode.steaming('Segment', {
  SeekHead: [{ // Seek
    SeekID: '1549a966',
    SeekPosition: 0xdf
  }, { // Seek
    SeekID: '1654ae6b',
    SeekPosition: 0x012a
  }, { // Seek
    SeekID: '1c53bb6b',
    SeekPosition: 0x0357fb
  }],
  Void: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  Info: {
    TimecodeScale: 1000000,
    MuxingApp: 'Lavf5 3.6.0',
    WritingApp: 'Lavf5 3.6.0',
    SegmentUID: '0000',
    Duration: 6042.0
  },
  Tracks: [{ // TrackEntry
    TrackNumber: 1,
    TrackUID: 1,
    FlagLacing: 0,
    Language: 'eng',
    CodecID: 'V_VP8',
    TrackType: 1,
    DefaultDuration: 33200000,
    Video: {
      PixelWidth: 320,
      PixelHeight: 240
    }
  }, {
    TrackNumber: 2,
    TrackUID: 2,
    FlagLacing: 0,
    Language: 'eng',
    CodecID: 'V_VORBIS',
    TrackType: 2,
    Audio: {
      Channels: 2,
      SamplingFrequency: 44100.0,
      BitDepth: 16
    }
    // CodecPrivate: new Buffer(0),
  }]
})

require('buffer').INSPECT_MAX_BYTES = 1024
console.log(segment)
