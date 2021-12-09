<template>
  <div v-if="$store.state.isMyTurn">
    <div style="text-align: center">
      <div style="display: inline-block">
        <div id="questions-container">
          <transition-group appear name="question-list">
            <div
              class="mt-1"
              style="color: white"
              v-if="questionCards.length === 1"
            >
              Tap to start round
            </div>
            <QuestionCard
              v-for="(questionCard, index) of visibleQuestionCards"
              :key="questionCard._id"
              class="question-card"
              :class="[
                cardNumberClass(index),
                highlightedClass(index),
                darkenedClass(index),
                !$store.state.isIOS && 'rotated',
              ]"
              @click.stop="onSelectQuestionCard(questionCard, index)"
              :question="questionCard.question"
            />
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QuestionCard from "@/components/QuestionCard";
import { ref, toRefs, watch } from "vue";
import { getRandomInt } from "@/utils/getRandomInt";
import { useStore } from "vuex";

export default {
  props: ["questionCards", "timesUp", "backgroundClick"],
  components: { QuestionCard },
  emits: ["questionSelected"],
  setup(props, context) {
    const { timesUp, backgroundClick } = toRefs(props);
    const store = useStore();
    const highlightedCardIndex = ref(null);
    const visibleQuestionCards = ref(props.questionCards);
    const questionConfirmed = ref(false);

    if (store.state.isMyTurn) {
      store.commit("setIsMyAction", true);
    } else {
      store.commit("setIsMyAction", false);
    }

    const onSelectQuestionCard = (questionCard, index) => {
      if (questionConfirmed.value) return;

      if (highlightedCardIndex.value === null) {
        return (highlightedCardIndex.value = index);
      }

      if (highlightedCardIndex.value !== index) {
        return (highlightedCardIndex.value = null);
      }

      highlightedCardIndex.value = null;
      questionConfirmed.value = true;
      visibleQuestionCards.value = [questionCard];

      context.emit("questionSelected", questionCard);
    };

    const moveOn = () => {
      const selectedCard =
        highlightedCardIndex.value === null
          ? pickRandomCard()
          : props.questionCards[highlightedCardIndex.value];

      highlightedCardIndex.value = null;
      questionConfirmed.value = true;
      visibleQuestionCards.value = [selectedCard];

      context.emit("questionSelected", selectedCard);
    };

    const pickRandomCard = () => {
      const randomCardIndex = getRandomInt(0, props.questionCards.length);

      return props.questionCards[randomCardIndex];
    };

    watch(backgroundClick, () => {
      highlightedCardIndex.value = null;
    });

    watch(timesUp, () => {
      if (timesUp.value) moveOn();
    });

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
      onSelectQuestionCard,
      highlightedCardIndex,
      visibleQuestionCards,
      cardNumberClass,
      highlightedClass,
      darkenedClass,
    };
  },
};
</script>

<style lang="scss" scoped>
#questions-container {
  display: grid;
  grid-template: 1fr / 1fr;
  perspective: 600px;

  .question-card {
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
    background-color: grey;
  }

  .card-0 {
    grid-area: 1 / 1 / 2 / 2;
  }

  .card-1 {
    grid-area: 1 / 1 / 2 / 2;
    margin-top: 100px;
  }

  .card-2 {
    grid-area: 1 / 1 / 2 / 2;
    margin-top: 200px;
  }
}

.question-list-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.question-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.question-list-move {
  transition: all 0.3s ease;
}

.question-list-enter-active {
  animation: card-drop 0.7s ease;
}
</style>
