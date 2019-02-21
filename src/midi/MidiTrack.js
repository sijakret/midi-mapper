// constants

const us2m = 60000000;

export class MidiTrack {
  constructor(data, header) {
    this.data = data;
    this.header = header;
  }


  emitUpdate() {
    if (this.dispatchEvent)
      this.dispatchEvent({
        type: 'input'
      });
  }

  toJSON() {
    return {
      data: this.data
    }
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

  set channel(channel) {
    this.data.forEach(d => {
      if('channel' in d) {
        d.channel = channel;
      }
    })
    this.emitUpdate();
  }

  get channel() {
    const channels = {};
    this.data.forEach(d => {
      if('channel' in d) {
        channels[d.channel] = true;
      }
    })
    return Object.keys(channels).map(Number);
  }

  get division() {
    this.data.forEach(d => {
      if('channel' in d) {
        d.channel = channel;
      }
    })
  }

  apply(event = () => {}) {
    this.data.forEach(event);
  }

  histogram(filter = () => true) {
    const deltas = {};
    this.data.forEach(d => {
      if(d.delta && filter(d)) {
        deltas[d.delta] = 
          (deltas[d.delta] || 0) + 1;
      }
    });
    return deltas;
  }

  set bpm(bpm) {
    bpm = Math.max(20,bpm);
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

    this.emitUpdate();
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
    this.emitUpdate();
  }

  get copy() {
    return new MidiTrack(
      JSON.parse(JSON.stringify(this.data)),
      this.header
    );
  }

  merge(other) {
    this.data.splice(this.data.length-1,0,...other.data);
    return this;
  }
}