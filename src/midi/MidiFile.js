import { parseArrayBuffer } from "midi-json-parser";
import { encode } from 'json-midi-encoder';

import { MidiTrack } from './MidiTrack'
const empty = {
  tracks: []
};

export class MidiFile {
  static async fromBuffer(buffer) {
    const parsed = await parseArrayBuffer(buffer);
    //const parsed = midifile.parseMidi(buffer.toString());
    return new MidiFile(parsed);
  }
  
  constructor(data = empty) {
    this.data = data;
    this.tracks = []
    while(this.tracks.length < 8) {
      this.tracks.push(null);
    }
    this.addTrack(this);
  }

  get header() {
    const header = Object.assign(
      {},
      this.data
    );
    delete header.tracks;
    return header
  }

  addTrack(midiFile, index) {
    if (index === undefined) {
      index = this.tracks.findIndex(t => !t);
    }
    const newTracks = midiFile.data.tracks.slice().map(t => {
      const track = new MidiTrack(
        t,
        this.header
      );

      const b = this.tracks.find(t => t && t.bpm);
      if(b) {
        if(!track.bpm) {
          track.bpm = b.bpm;
        } else {
          if(!track.bpm === b.bpm) {
            alert(`bpm missmatch ${b.bpm} (present), ${track.bpm} (new file)`);
          }
        }
      } else {
        // first track
      }
      return track;
    });
    this.tracks.splice(index, 1, newTracks[0]);
  }

  async toBuffer(mergeName) {
    const nonEmpty = this.tracks.filter(t=>!!t);
    const tracks = (mergeName ? [
      nonEmpty.slice(1).reduce((m,t) => m.merge(t), nonEmpty[0])
    ] : nonEmpty
    );

    if(mergeName) {
      tracks[0].name = mergeName;
    }


    const copy = Object.assign({}, 
      this.data,
      {
        tracks: tracks.map(t => t.data)
      }
    );
    const buffer = await encode(copy);
    return buffer;
  }
}
