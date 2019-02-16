<template>
  <div :class="{ track: true, over}" 
    @drop="$emit('drop', $event);" 
    @dragover="$event.preventDefault(); over = true"
    @dragleave="$event.preventDefault(); over = false">
    <div class="content" v-if="track">
      <div class="index heading">{{ index+1 }}</div>
      <div class="name" v-if="track.name">
        {{track.name}}
      </div> 

      <div class="signature" v-if="track.signature">
        {{ track.signature.numerator }}/{{ track.signature.denominator }}
      </div>
      <div class="tempo" v-if="track.bpm">
        {{ track.bpm }}bpm
      </div>
      <div class="tempo error" v-else @click="track.bpm = 120">
        no tempo
      </div>
      <div class="duration" v-if="track.duration">
        {{displayMinutes(track.duration)}}min
      </div> 
      <div class="channel" v-if="false">
        <select v-model="track.channel">
          <option v-for="i in 10" :key="i" :value="i">{{i}}</option>
        </select>
      </div> 
    </div>
    <div class="content empty" v-else>
      <div class="index heading">{{ index+1 }}</div>
      <div >
        drop midi file here <i>(channel {{index+1}} will be assigned to all events)</i>
      </div> 
    </div>
  </div>
</template>

<script>
import { displayMinutes } from "../utils";
export default {
  name: "Track",
  data: () => ({
    over: false,
  }),
  props: {
    track: {
      type: Object
    },
    index: {
      type: Number
    }
  },
  computed: {
  },
  methods: {
    displayMinutes
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '../vars.scss';

.track.over {
  box-shadow: 2px 2px 5px 1px rgba(0,0,0,0.3);
}
.track {
  display: flex;
  flex-direction: column;
  background-color: $lighter2;
  border-radius: 4px;

  .empty, .content {
    display: flex;
    >div {
      flex: 1 0;
      padding: 10px;
      border-radius: 4px;
    }
  }
  .empty {
    opacity: 0.5;
  }

  .content {
    .index {
      flex: 0 0;
      background: $darker2;
      &:before {
        content: 'CH'
      }
    }
    .name {
      flex: 2 0;
      background: $base;
    }
    .signature {
      flex: 0 0;
      font-style: italic;
      background: $lighter1;
    }
    .tempo {
      flex: 0 0;
      font-style: italic;
      background: $lighter2;
    }
    .tempo.error {
      background-color: rgba(255,0,0,0.5);
      color: rgba(255,255,255,1);
    }
    .duration {
      flex: 0 0;
      background: $lighter1;
    }
    .channel {
      width: 50px;
      background: $darker1;
      &:before {
        content: '';
        margin-left: -10px;
        position: absolute;
        width: 0;
        height: 0; 
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        
        border-left: 10px solid $lighter1;
      }
    }
  }
  .header {
    display: flex;
    flex-basis: row;
    .signature {
      flex: 1 1;
      &:before {
        content: "Signature: "
      }
    }
    .tempo {
      flex: 1 1;
      &:before {
        content: "Tempo: "
      }
    }
  }
}
</style>
