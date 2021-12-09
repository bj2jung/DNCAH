<template>
  <div
    id="answerCard"
    class="p-2 w-40 h-52 font-semibold rounded-lg shadow-lg"
    :class="{
      unrevealed: unrevealed,
    }"
  >
    <span v-if="unrevealed && $store.state.isMyTurn">Tap to reveal</span>

    <span v-else-if="unrevealed && !$store.state.isMyTurn">Waiting...</span>

    <span class="text-sm" :class="{ unrevealed: unrevealed }">
      {{ answerText }}
    </span>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
export default {
  props: ["answer", "unrevealed", "selectable"],
  setup(props) {
    const answerText = ref(props.answer);

    return {
      answerText,
    };
  },
};
</script>

<style scoped lang="scss">
#answerCard {
  background-color: #fdfdfd;
  border-width: 3px;
  border-color: #787878;
  text-align: left;

  span {
    &.unrevealed {
      display: none;
    }
  }
}
</style>
