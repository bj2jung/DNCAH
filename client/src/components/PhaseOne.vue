<template>
  <div class="px-2">
    <transition appear style="transform-origin: center" name="question">
      <QuestionCard
        :question="currentQuestion.question"
        :changeQuestionToBanner="true"
      />
    </transition>
  </div>
</template>

<script>
import QuestionCard from "@/components/QuestionCard";
import { useStore } from "vuex";
export default {
  components: { QuestionCard },
  props: ["currentQuestion", "timesUp"],
  setup() {
    const store = useStore();

    if (store.state.isMyTurn) {
      store.commit("setIsMyAction", false);
    } else {
      store.commit("setIsMyAction", true);
    }

    return {};
  },
};
</script>

<style lang="scss" scoped>
.question-enter-active {
  animation: card-drop 0.7s ease;
}
</style>
