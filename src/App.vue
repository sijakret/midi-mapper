<template>
  <div id="app" @drop="drop" @dragover="$event.preventDefault();">
    <div style="padding: 40px">
      <h1>Midi Merger</h1>
      <h2 style="margin-top: -20px; font-style: italic">(Roland Juno DS pattern sequencer tool)</h2>
      <h3>About</h3>
      <p>Some DAWs (like ableton) cannot store midi files with per-event channel info.
      This tool merges events (noteOn, CV) of several midi (smf0) files into one midi (smf0) file
      and assigns a specifiable channel to all events from the respective original files.
      The merged midi file can then, for example, be imported in the pattern sequencer of a Roland Juno DS
      and the individual files will end up in the respective patterns slots (1-8).</p>

      <p>
        This tool also allows compressing a given midi sequence into a minimum number of
        bars (like 8 or even 4).
        For this, the amount of quarters per Bar are raised to get longer bars.
        Example: 8 Bars of 4/4 can be mapped to 1 Bar of 32/4.
        At the same time, the tempo is lowered as far as needed to accommodate even more data in less bars.
        Depending on the length your midi tracks.
        <i>
          Please note: The temporal resolution in a bar degrades the more data is packed into a small amount of bars at low bpm.
        </i>
      </p>

      <h3>Limitations</h3>
      <li>only smf0 is supported</li>
      <li>only noteOn + cvChange events are supported</li>
      <li>all input files must have same signature + bpm and start time</li>
    </div>
    <div class="sequencer" v-if="midi">
      <midi-track v-for="(track, i) in midi.tracks"
        style="margin: 10px"
        :index="i"
        :key="i" 
        :track="track" 
        @drop="drop($event,i)"/>

      <div style="display: flex; padding: 20px;">
        <div style="flex: 1 1"></div>
        <div class="icon-button" @click="save" title="generate midi">
          <i class="text">merge and download midi</i>
          <i class="fas fa-file-download"></i>
        </div>
        <div style="flex: 1 1"></div>
      </div>
    </div>

  </div>
</template>

<script>
import MidiTrack from "./components/Track";
import { MidiFile } from "./midi";
import { loadFile, download } from "./utils";
import fs from "fs";

export default {
  name: "App",
  data() {
    return {
      midi: new MidiFile()
    };
  },
  mounted() {
    //this.loadFile();
  },
  methods: {
    async save() {
      const buffer = await this.midi.toBuffer('Multichannel');
      download(buffer,'test.mid');
      console.log(buffer, this.lastBuffer);
    },
    async drop(event, track) {
      event.preventDefault();
      event.stopPropagation();
      const buffer = await loadFile(event);
      this.load(buffer, track);
    },
    async loadFile() {
      const buffer = require('arraybuffer-loader!../data/CLK-C0-40bpm.mid');
      this.load(buffer.slice());
    },
    async load(buffer, track) {
      this.lastBuffer = buffer.slice();
      const midi = await MidiFile.fromBuffer(buffer);
      if(this.midi) {
        this.midi.addTrack(midi, track);
      } else {
        this.midi = midi;
      }
      console.log(this.midi);
    }
  },
  components: {
    MidiTrack
  }
};
</script>

<style lang="scss">
@import './main.scss';
</style>
