import { parseArrayBuffer } from "midi-json-parser";
import { encode } from 'json-midi-encoder';

import { MidiTrack } from './MidiTrack'
const empty = {
  format: 0,
  tracks: []
};

export class MidiFile {
  static async fromBuffer(buffer) {
    const parsed = await parseArrayBuffer(buffer);
    return new MidiFile(parsed);
  }
  
  constructor(data = empty, maxTracks = 4, assignChannel) {
    this.assignChannel = assignChannel;
    this.data = data;
    this.tracks = []
    while(this.tracks.length < maxTracks) {
      this.tracks.push(null);
    }
    this.addTrack(this);
  }
  
  toJSON(key) {
    if(key === 'data')
      return this.data;
  }

  get header() {
    const header = Object.assign(
      {},
      this.data
    );
    delete header.tracks;
    return header
  }

  emitUpdate() {
    if (this.dispatchEvent)
      this.dispatchEvent({
        type: 'input',
        midiFile: (merge) => this.copy(merge)
      });
  }

  histogram(filter = () => true) {
    const deltas = {};
    this.tracks.forEach(t => {
      if(!t) return;
      const histogram = t.histogram(filter);
      for(let d in histogram) {
        deltas[d] = 
          (deltas[d] || 0) + histogram[d];
      };
    });
    return deltas;
  }

  get division() {
    return this.data.division;
  }

  set division(division = this.division) {
    const fraction = division / this.division;
    let delta = 0;
    const map = (testOnly) => (event) => {
      if (event.delta) {
        delta += event.delta;
        const aliases = Math.round(
          event.delta * fraction
        ) / fraction !== event.delta;
        if (!aliases) {
          if(!testOnly) {
            event.delta *= fraction;
          }
        } else {
          throw new Error(`midi event aliased (delta: ${delta})`);
        }
      }
      return true;
    }
    this.nonEmpty.forEach(t => {
      t.apply(map(true))
    });

    this.emitUpdate();
  }

  addTrack(midiFile, index) {
    if (index === undefined) {
      index = this.tracks.findIndex(t => !t);
    }

    // set division if there is none
    if(!this.data.division) {
      this.data.division = midiFile.data.division;
    } else {
      if(this.data.division !== midiFile.data.division) {
        throw new Error('division of midi tracks does not match')
      }
    }
    if(this.data.format !== 0) {
      throw new Error('only midi format 0 supported');
    }

    const newTracks = midiFile.data.tracks.slice().map(t => {
      const track = new MidiTrack(
        t,
        this.header
      );
      track.dispatchEvent = () => this.emitUpdate();

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

    if(newTracks.length > 1) {
      // check if every file has a unique
      // channel
      newTracks.forEach((t,i) => {
        if (t.channel.length > 1) {
          throw new Error(`Track ${i} sends data to multiple channels.
          This is not supported.
          Only smf0 files are supported`);
        } else {
        }
      });
      this.tracks = newTracks;
    } if(newTracks.length > 0) {
      // smf0 file
      const newTrack = newTracks[0];
      if (this.assignChannel) {
        newTrack.channel = index;
      }
      this.tracks.splice(index, 1, newTrack);
    } else {
      // empty file
    }
    this.emitUpdate();
  }

  get nonEmpty() {
    return this.tracks.filter(t=>!!t);
  }

  async toBuffer() {
    const flat = Object.assign({}, 
      this.data,
      {
        tracks: this.nonEmpty.map(t => t.data)
      }
    );
    const buffer = await encode(flat);
    return buffer;
  }
  
  remove(index) {
    this.tracks.splice(index,1, null);
    this.emitUpdate();
  }

  copy(merge) {
    const tracks = merge && this.nonEmpty.length > 0 ? [
      this.nonEmpty.slice(1).reduce(
        (m,t) => m.merge(t), 
        this.nonEmpty[0].copy)
    ] : this.nonEmpty

    const flat = Object.assign({}, 
      this.data,
      {
        tracks: tracks.map(t => t.data)
      }
    );
    return tracks.length > 0 ? new MidiFile(
      JSON.parse(JSON.stringify(flat)),
      tracks.length
    ) : new MidiFile(undefined);
  }

}
