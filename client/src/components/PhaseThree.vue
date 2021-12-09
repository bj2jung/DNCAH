<template>
  <div class="px-2">
    <div v-if="!isGameOver">
      <teleport to="#modal">
        <Modal :showModal="showModal" @close="showModal = false">
          <Scoreboard :roundWinnerId="bestAnswer.sender" />
        </Modal>
      </teleport>
      <div class="mt-4">
        <QuestionCard
          :question="currentQuestion?.question"
          :changeQuestionToBanner="true"
        />
      </div>
      <div id="answer-card-container" class="mt-4 text-center">
        <AnswerCard
          class="inline-block answer-card"
          :answer="bestAnswer?.answer"
          :unrevealed="false"
        />
      </div>
    </div>
    <div v-if="isGameOver">
      <GameSummary :winner="winner" />
    </div>
  </div>
</template>

<script>
import AnswerCard from "@/components/AnswerCard";
import QuestionCard from "@/components/QuestionCard";
import GameSummary from "@/components/GameSummary";
import Modal from "@/components/Modal";
import Scoreboard from "@/components/Scoreboard";
import { useStore } from "vuex";
import { computed, ref } from "@vue/reactivity";

export default {
  props: ["bestAnswer", "currentQuestion"],
  components: {
    AnswerCard,
    GameSummary,
    QuestionCard,
    Modal,
    Scoreboard,
  },
  emits: ["startNewTurn"],
  setup(props, context) {
    const store = useStore();
    const isGameOver = ref(false);
    const winner = ref(null);
    const showModal = ref(true);
    const didAnyPlayerReachWinningScore = computed(() => {
      return store.state.playerListOrdered.filter(
        (player) => player.score >= store.state.gameSettings.pointsToWin
      );
    });

    store.commit("rewardPointToPlayer", props.bestAnswer.sender);

    store.commit("setIsMyAction", false);

    setTimeout(() => {
      showModal.value = false;
    }, 2500);

    setTimeout(() => {
      if (didAnyPlayerReachWinningScore.value.length) {
        isGameOver.value = true;
        store.commit("setIsGameInProgress", false);
        winner.value = didAnyPlayerReachWinningScore.value[0];
        window.onbeforeunload = null;
      } else {
        context.emit("startNewTurn");
      }
    }, 4000);

    return { winner, isGameOver, showModal };
  },
};
</script>

<style lang="scss" scoped>
#answer-card-container {
  perspective: 600px;

  .answer-card {
    transform: rotateX(10deg);
  }
}
</style>
