<template>
  <div id="statusBar" class="grid">
    <teleport to="#modal">
      <Modal :showModal="showModal" @close="showModal = false">
        <Scoreboard />
      </Modal>
    </teleport>
    <div>
      <button @click.stop="showModal = true" class="p-2 h-14 w-14">
        <img src="../assets/podium.png" style="filter: invert(100%)" />
      </button>
    </div>
    <div class="justify-self-end" v-if="$store.state.isGameInProgress">
      <div v-if="$store.state.isMyAction" class="h-10 w-10">
        <CountdownTimer @times-up="onTimesUp" ref="countdownTimerRef" />
      </div>
      <template v-else>
        <div class="blinking p-2 h-14 w-14">
          <img src="../assets/wait.png" style="filter: invert(100%)" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import CountdownTimer from "@/components/CountdownTimer";
import Modal from "@/components/Modal";
import Scoreboard from "@/components/Scoreboard";
import { ref } from "vue";

export default {
  components: { CountdownTimer, Modal, Scoreboard },
  props: ["currentPhase"],
  emits: ["timesUp"],
  setup(props, context) {
    const countdownTimerRef = ref(null);
    const showModal = ref(false);

    const restartTimer = () => {
      countdownTimerRef.value.startTimer();
    };

    const onTimesUp = () => {
      context.emit("timesUp");
    };

    return { onTimesUp, restartTimer, countdownTimerRef, showModal };
  },
};
</script>

<style lang="scss" scoped>
#statusBar {
  grid-template: 1fr / 1fr 1fr;
}

.blinking {
  animation: blink 3s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
