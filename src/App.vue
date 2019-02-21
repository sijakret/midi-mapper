<template>
  <div id="app">
    <div style="padding: 20px; flex: 1 1">
      <h1>Midi Squeezer</h1>
      <h2 style="margin-top: -20px; font-style: italic">(Roland Juno DS pattern sequencer tool)</h2>
      <h3>About</h3>
      <p>
        Creates a mulitrack Midi file (smf0) and allows to resample it to fit into a
        number of target bars.
        Please read the corresponding article <a href="TODO" style="text-decoration: none">here</a>!
      <!--// p>Some DAWs (like ableton) cannot store midi files with per-event channel info.
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
      </p //-->

      <h3>Limitations</h3>
      <li>only smf0 is supported</li>
      <li>only noteOn + cvChange events are supported</li>
      <li>all input files must have same signature + bpm and start time</li>


      <h3>Usage</h3>
      <li>drop a few midi files on the corresponding channels</li>
      <li>bpm of first track will dictate bpm of output</li>
      <li>merged file will be updated automatically</li>
      <li>adjust the target limits (bars, min speed, signature, ..)</li>
      <li>final file with compressed timings will update automatically</li>
    </div>
    
    <div style="padding: 20px; flex: 1 1">
      <h4>Drop tracks</h4>
      <midi-file 
        :num-tracks="4" 
        @input="newMix"
        :assign-channel="true"/>

      <div class="pulse">
        <transition name="pulse">
          <i class="fas fa-arrow-circle-down arrow" :key="pulse1"></i>
        </transition>
      </div>

      <h4>Adjust target limits</h4>
      <midi-file 
        ref="out"
        :num-tracks="1">
        <i class="fas fa-file-download button"></i>
      </midi-file>

      <div class="pulse">
        <transition name="pulse">
          <i class="fas fa-arrow-circle-down arrow" :key="pulse2"></i>
        </transition>
      </div>

      <h4>Final midi file</h4>
      <midi-file 
        ref="out1"
        :num-tracks="1"/>
    </div>
  </div>
</template>

<script>
import MidiFile from "./components/File";

export default {
  name: "App",
  data() {
    return {
      pulse1: 0,
      pulse2: 0
    };
  },
  methods: {
    async newMix(update) {
      const copy = update.midiFile(true);
      this.$refs.out.load(copy,0);
      this.$forceUpdate();
      this.pulse1++;
    }
  },
  components: {
    MidiFile
  }
};
</script>

<style lang="scss">
@import './main.scss';

#app {
  display: flex;
}

h4 {
  margin-left: 30px;
}
a, a:visited {
  color: $darker2;
}
.pulse {
  display: block;
  margin: auto;
  position: relative;
  height: 1px;
  .arrow {
    width: 100%;
    position: absolute;
    color: $base;
    display: block;
    z-index: 1;
    margin-top: -8px;
    font-weight: 800;
    text-align: center;
    font-size: 60px;
  }
}

.pulse-enter-active, .pulse-leave-active {
  transition: all 0.25s ease-out;
}

.pulse-enter, .pulse-leave-to {
  transform: scale(1.5);
  opacity: 0;
}



</style>
