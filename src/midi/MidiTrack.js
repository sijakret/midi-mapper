// constants

const us2m = 60000000;

export class MidiTrack {
  constructor(data, header) {
    this.data = data;
    this.header = header;
  }

  get ticks() {
    return this.data.reduce((delta, item) => 
    delta + (item.delta || 0)
    , 0);
  }
  get quarters() {
    const div = this.signature.denominator / 4;
    return this.beats / 
      this.signature.numerator
  }
  get duration() {
    return this.bpm ? 
      ((this.ticks / this.header.division )
      * this.usPerBeat) / us2m
      : null;
  }

  get signature() {
    const sig = this.data.find(e => e.timeSignature);
    return sig ? sig.timeSignature : null;
  }

  get usPerBeat() {
    const tempo = this.data.find(e => e.setTempo);
    return tempo ? tempo.setTempo.microsecondsPerBeat
      : null;
  }

  get bpm() {
    const us = this.usPerBeat
    return us ? us2m / us : null;
  }

  set bpm(bpm) {
    const tempo = this.data.find(e => e.setTempo);
    if(tempo) {
      // modifies first tempo event
      tempo.setTempo.microsecondsPerBeat = us2m / bpm;
    } else {
      // insers dempo event
      this.data.splice(0, 0, {
        delta: 0,
        setTempo: {
          microsecondsPerBeat: us2m / bpm
        }
      });
    }
  }

  get name() {
    const name = this.data.find(e => e.trackName);
    return name ? name.trackName : null;
  }

  set name(trackName) {
    const name = this.data.find(e => e.trackName);
    if(name) {
      // modifies first tempo event
      name.trackName = trackName;
    } else {
      // insers dempo event
      this.data.splice(0, 0, {
        delta: 0,
        trackName
      });
    }
  }

  merge(other) {
    return this;
  }
}