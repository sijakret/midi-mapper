<template>
  <div @drop="drop" @dragover="$event.preventDefault();">
    <div v-if="midi" class="sequencer" >
      <midi-track v-for="(track, i) in midi.tracks"
        style="margin: 10px"
        :index="i"
        :key="i" 
        :track="track"
        :assign-channel="assignChannel"
        @input="$emit($event.type, $event)"
        @delete="remove(i)"
        @drop="drop($event,i)" />
    </div>
    <div v-if="$slots.default" style="display: flex; padding-right: 20px;">
      <div style="flex: 1 1"></div>
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@fortawesome/fontawesome-free/scss/fontawesome.scss';
</style>

<script>
import MidiTrack from "./Track";
import { MidiFile } from "../midi";
import { loadFile, download } from "../utils";
import fs from "fs";

export default {
  name: "File",
  props: {
    buttons: {
      type: Boolean,
      default: false
    },
    numTracks: {
      type: Number,
      default: 1
    },
    assignChannel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      midi: new MidiFile(undefined, this.numTracks, this.assignChannel)
    };
  },
  mounted() {
    //this.loadFile();
    this.midi.dispatchEvent = (event) => {
      this.$emit(event.type, event);
    }
  },
  methods: {
    remove(index) {
      this.midi.remove(index);
    },
    async save(name = 'midi.mid') {
      const buffer = await this.midi.toBuffer('Multichannel');
      download(buffer,name);
      console.log(buffer, this.lastBuffer);
    },
    async drop(event, track) {
      event.preventDefault();
      event.stopPropagation();
      const buffer = await loadFile(event);
      this.loadFromBuffer(buffer, track);
    },
    async loadFromBuffer(buffer, track) {
      this.lastBuffer = buffer.slice();
      const midi = await MidiFile.fromBuffer(buffer);
      return this.load(midi, track)
    },
    async load(midi, track) {
      if(midi.nonEmpty.length === 0) {
        this.midi = new MidiFile(
          undefined,
          this.numTracks,
          this.assignChannel
        );
      } else if(this.midi) {
        this.midi.addTrack(midi, track);
        console.log('noteOn', this.midi.histogram(e => !!e.noteOn));
        console.log('noteOff', this.midi.histogram(e => !!e.noteOff));
        console.log(this.midi.histogram());
      } else {
        this.midi = midi;
      }
    }
  },
  components: {
    MidiTrack
  }
};
</script>