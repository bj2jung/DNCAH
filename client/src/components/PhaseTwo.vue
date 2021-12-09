<template>
  <div class="mb-4 px-2">
    <QuestionCard
      :question="currentQuestion.question"
      :changeQuestionToBanner="true"
    />
  </div>
  <div style="text-align: center;">
    <div style="display: inline-block">
      <div
        :id="
          !bestAnswerSelectingPhase
            ? 'unrevealed-answer-cards-container'
            : 'selecting-best-answer-container'
        "
      >
        <AnswerCard
          v-for="(answer, index) in visibleAnswerCards"
          :key="answer._id"
          class="answer-card"
          :class="[
            cardNumberClass(index),
            highlightedClass(index),
            darkenedClass(index),
            !$store.state.isIOS && 'rotated',
            !answer.unrevealed && 'revealed',
          ]"
          :answer="answer.answer"
          :unrevealed="answer.unrevealed"
          @click.stop="selectCard(answer, index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AnswerCard from "@/components/AnswerCard";
import QuestionCard from "@/components/QuestionCard";
import { computed, ref, toRefs } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { getRandomInt } from "@/utils/getRandomInt";
import { useStore } from "vuex";

export default {
  components: { AnswerCard, QuestionCard },
  props: [
    "currentQuestion",
    "currentAnswers",
    "timesUp",
    "revealedAnswer",
    "bestAnswer",
    "backgroundClick",
  ],
  emits: ["answerRevealed", "bestAnswerSelected"],
  setup(props, context) {
    const { timesUp, bestAnswer, revealedAnswer, backgroundClick } = toRefs(
      props
    );
    const store = useStore();
    const highlightedCardIndex = ref(null);
    const bestAnswerConfirmed = ref(false);
    const visibleAnswerCards = ref(props.currentAnswers);
    const bestAnswerSelectingPhase = ref(false);
    const isRevealing = ref(false);

    if (store.state.isMyTurn) {
      store.commit("setIsMyAction", true);
    } else {
      store.commit("setIsMyAction", false);
    }

    const areAllAnswersRevealed = computed(() =>
      visibleAnswerCards.value.every((answer) => !answer.unrevealed)
    );

    watch(areAllAnswersRevealed, () => {
      setTimeout(() => {
        bestAnswerSelectingPhase.value = true;
      }, 5000);
    });

    watch(timesUp, () => {
      if (timesUp.value) moveOn();
    });

    watch(bestAnswer, () => {
      if (bestAnswer.value) {
        visibleAnswerCards.value = [bestAnswer.value];
      }
    });

    watch(backgroundClick, () => {
      highlightedCardIndex.value = null;
    });

    watch(revealedAnswer, () => {
      if (revealedAnswer.value) {
        visibleAnswerCards.value.find(
          (answer) => answer.answer === revealedAnswer.value
        ).unrevealed = false;
      }
    });

    const moveOn = () => {
      if (!areAllAnswersRevealed.value) {
        revealAnswer();
      } else {
        selectRandomBestAnswer();
      }
    };

    const selectCard = (answer, index) => {
      if (!store.state.isMyTurn) return;
      if (isRevealing.value) return;

      if (!bestAnswerSelectingPhase.value) {
        revealAnswer(answer);
      } else {
        selectBestAnswer(answer, index);
      }
    };

    const revealAnswer = () => {
      isRevealing.value = true;
      const answerToReveal = visibleAnswerCards.value.find(
        (answer) => answer.unrevealed === true
      );

      answerToReveal.unrevealed = false;

      context.emit("answerRevealed", answerToReveal);
      setTimeout(() => {
        isRevealing.value = false;
      }, 5000);
    };

    const selectRandomBestAnswer = () => {
      const selectedAnswer =
        highlightedCardIndex.value === null
          ? visibleAnswerCards.value[
              getRandomInt(0, visibleAnswerCards.value.length)
            ]
          : visibleAnswerCards.value[highlightedCardIndex.value];

      highlightedCardIndex.value = null;
      bestAnswerConfirmed.value = true;

      context.emit("bestAnswerSelected", selectedAnswer);
    };

    const selectBestAnswer = (answer, index) => {
      if (bestAnswerConfirmed.value) return;

      if (highlightedCardIndex.value === null) {
        return (highlightedCardIndex.value = index);
      }

      if (highlightedCardIndex.value !== index) {
        return (highlightedCardIndex.value = null);
      }

      highlightedCardIndex.value = null;
      bestAnswerConfirmed.value = true;

      context.emit("bestAnswerSelected", answer);
    };

    const cardNumberClass = (index) => {
      return `card-${index}`;
    };

    const highlightedClass = (index) => {
      if (highlightedCardIndex.value === null) return undefined;
      return index === highlightedCardIndex.value ? "highlighted" : undefined;
    };

    const darkenedClass = (index) => {
      if (highlightedCardIndex.value === null) return undefined;
      return index !== highlightedCardIndex.value ? "darkened" : undefined;
    };

    return {
      revealAnswer,
      areAllAnswersRevealed,
      selectBestAnswer,
      highlightedCardIndex,
      visibleAnswerCards,
      bestAnswerSelectingPhase,
      selectCard,
      cardNumberClass,
      highlightedClass,
      darkenedClass,
    };
  },
};
</script>

<style lang="scss" scoped>
.answer-card {
  grid-area: 1 / 1 / 2 / 2;
  transition: all 0.3s ease;
}

.rotated {
  transform: rotateX(10deg);
}

.highlighted {
  z-index: 1;
  transform: scale(1.05);

  &.rotated {
    transform: rotateX(10deg) scale(1.05);
  }
}

.darkened {
  background-color: grey !important;
}

#unrevealed-answer-cards-container {
  display: grid;
  grid-template: 1fr / 1fr;
  perspective: 600px;
  margin: auto;

  .card-0 {
    z-index: 8;
  }

  .card-1 {
    margin-top: 10px;
    z-index: 7;
  }

  .card-2 {
    margin-top: 10px;
    z-index: 6;
  }

  .card-3 {
    margin-top: 10px;
    z-index: 5;
  }

  .card-4 {
    margin-top: 10px;
    z-index: 4;
  }

  .card-5 {
    margin-top: 10px;
    z-index: 3;
  }

  .card-6 {
    margin-top: 10px;
    z-index: 2;
  }

  .card-7 {
    margin-top: 10px;
    z-index: 1;
  }

  .revealed {
    animation: revealCard 5s;
    animation-fill-mode: forwards;
  }
}

#selecting-best-answer-container {
  display: grid;
  grid-template: 1fr / auto auto;
  perspective: 600px;

  .card-0 {
    grid-area: 1 / 1 / 2 / 2;
  }

  .card-1 {
    grid-area: 1 / 1 / 2 / 2;
    margin-top: 3em;
  }

  .card-2 {
    grid-area: 1 / 1 / 2 / 2;
    margin-top: 6em;
  }

  .card-3 {
    grid-area: 1 / 1 / 2 / 2;
    margin-top: 9em;
  }

  .card-4 {
    grid-area: 1 / 2 / 2 / 3;
  }

  .card-5 {
    grid-area: 1 / 2 / 2 / 3;
    margin-top: 3em;
  }

  .card-6 {
    grid-area: 1 / 2 / 2 / 3;
    margin-top: 6em;
  }

  .card-7 {
    grid-area: 1 / 2 / 2 / 3;
    margin-top: 9em;
  }
}

@keyframes revealCard {
  3% {
    transform: rotateX(1turn);
  }

  15% {
    transform: rotateX(1turn) scale(1.13);
  }

  97% {
    transform: rotateX(1turn) scale(1.2);
  }

  100% {
    transform: scale(1) translateY(100vh);
  }
}

// .answer-list-leave-to {
//   opacity: 0;
//   transform: scale(0.6);
// }

// .answer-list-leave-active {
//   transition: all 0.3s ease;
//   position: absolute;
// }

// .answer-list-move {
//   transition: all 0.3s ease;
// }
</style>
