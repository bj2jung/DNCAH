<template>
  <div
    class="p-2 w-48 h-60 text-sm font-semibold shadow-lg flex-shrink-0 rounded-lg"
    :class="{
      unrevealed: unrevealed,
      banner: changeQuestionToBanner,
      'text-base': changeQuestionToBanner,
    }"
    id="question-card"
  >
    {{ questionText }}
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
export default {
  props: ["question", "changeQuestionToBanner"],
  setup(props) {
    const questionText = ref(props.question);

    return { questionText };
  },
};
</script>

<style lang="scss" scoped>
#question-card {
  color: #fafafa;
  background-color: black;
  border: 3px solid white;
  text-align: left;

  &.banner {
    transition: 0.7s ease;
    height: 8rem;
    width: 100%;
  }
}
</style>
