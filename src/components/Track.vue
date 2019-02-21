<template>
  <div :class="{ track: true, over}" 
    @drop="$emit('drop', $event); over = false" 
    @dragover="$event.preventDefault(); over = true"
    @dragleave="$event.preventDefault(); over = false">
    <div class="content" v-if="track">
      <div class="channel heading" v-if="false">{{ index+1 }}</div>
      <div class="channels heading" v-else>
        <div v-for="i in channels" 
          :key="i" 
          :class="{ c: true, on: -1!==track.channel.indexOf(i-1) }"
          :title="`Channel ${i} ${-1!==track.channel.indexOf(i-1)?'(used)':'(not used)'}`">
        </div>
      </div>
      <div class="name" v-if="track.name">
        {{track.name}}
      </div> 

      <div class="signature" v-if="track.signature">
        {{ track.signature.numerator }}/{{ track.signature.denominator }}
      </div>
      <div class="tempo" v-if="track.bpm">
        <input :value="track.bpm" @blur="setTempo" @keydown="$event.key === 'Enter' ? $event.currentTarget.blur() : null"/>bpm
      </div>
      <div class="tempo error" v-else @click="track.bpm = 120">
        no tempo
      </div>
      <div class="duration" v-if="track.duration">
        {{displayMinutes(track.duration)}}min
      </div> 
      <div class="close" @click="$emit('delete')">
        <i class="fas fa-times"></i>
        <select v-model="track.channel" v-if="false">
          <option v-for="i in 10" :key="i" :value="i">{{i}}</option>
        </select>
      </div> 
    </div>
    <div class="content empty" v-else>
      <div class="channel heading" v-if="false">{{ index+1 }}</div>
      <div class="channels heading" v-else>
        <div v-for="i in channels" 
          :key="i" 
          :class="{ c: true, on: assignChannel && i === index+1}"
          :title="`Channel ${i+1}`">
        </div>
      </div>
      <div >
        <template v-if="assignChannel">
          drop midi file here for channel {{index+1}}
        </template>
        <template v-else>
          drop midi file here <i>(channel info won't be touched)</i>
        </template>
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
    channels: 4
  }),
  props: {
    track: {
      type: Object
    },
    assignChannel: {
      type: Boolean,
    },
    index: {
      type: Number
    }
  },
  computed: {
  },
  methods: {
    displayMinutes,
    setTempo(event) {
      this.track.bpm = Number(event.currentTarget.value);
      this.$forceUpdate();
    }
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
    .channel {
      flex: 0 0;
      background: $darker2;
      &:before {
        content: 'CH'
      }
    }
    .channels {
      background: $darker2;
      display: flex;
      flex: 0 0;
      .c {
        margin: auto;
        margin-left: 1px;
        margin-right: 1px;
        border: 1px solid rgba(0,0,0,0.1);
        height: 8px;
        width: 8px;
      }
      .c.on {
        background: #000000;
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
      input {
        width: 30px;
        text-align: right;
      }
      font-style: italic;
      background: $lighter2;
      white-space: nowrap;
    }
    .tempo.error {
      background-color: rgba(255,0,0,0.5);
      color: rgba(255,255,255,1);
    }
    .duration {
      flex: 0 0;
      background: $lighter1;
    }

    .close {
      flex: 0 0;
      background: $darker2;
      cursor: pointer;
    }
    /*
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
    */
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
