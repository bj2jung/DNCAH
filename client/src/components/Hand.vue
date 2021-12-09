<template>
  <div id="hand-container" class="grid px-3">
    <AnswerCard
      v-for="(card, index) in myAnswerCards"
      :key="card._id"
      :answer="card.answer"
      :selectable="!isAnswerSelected"
      @click.stop="selectAnswer(card, index)"
      class="answer-card"
      :class="[
        cardNumberClass(index),
        highlightedClass(index),
        darkenedClass(index),
        !$store.state.isIOS && 'rotated',
      ]"
    />
    <CustomAnswerCard
      @click.stop="selectCustomAnswer(card, myAnswerCards.length)"
      @confirm-custom-answer="confirmCustomAnswer"
      v-if="$store.state.gameSettings.customAnswers"
      class="answer-card"
      :class="[
        `card-${myAnswerCards.length}`,
        highlightedClass(myAnswerCards.length),
        darkenedClass(myAnswerCards.length),
        !$store.state.isIOS && 'rotated',
      ]"
      :editMode="customAnswerEditMode"
      :isAnswerSelected="isAnswerSelected"
    />
  </div>
</template>

<script>
import AnswerCard from "@/components/AnswerCard";
import CustomAnswerCard from "@/components/CustomAnswerCard";
import { useStore } from "vuex";
import { ref, toRefs } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { getRandomInt } from "@/utils/getRandomInt";

export default {
  components: { AnswerCard, CustomAnswerCard },
  props: [
    "myAnswerCards",
    "timesUp",
    "isMyTurn",
    "selectable",
    "backgroundClick",
    "currentPhase",
  ],
  emits: ["answerSelected"],
  setup(props, context) {
    const store = useStore();
    const highlightedCardIndex = ref(null);
    const { timesUp, selectable, backgroundClick, currentPhase } = toRefs(
      props
    );
    const isAnswerSelected = ref(false);

    watch(timesUp, () => {
      if (timesUp.value && !props.isMyTurn) moveOn();
    });

    watch(selectable, () => {
      if (selectable.value) {
        highlightedCardIndex.value = null;
      }
    });

    watch(backgroundClick, () => {
      highlightedCardIndex.value = null;
    });

    watch(currentPhase, () => {
      if (currentPhase.value > 1) isAnswerSelected.value = false;
    });

    const moveOn = () => {
      if (!props.selectable) return;

      const cardIndex =
        highlightedCardIndex.value !== null && customAnswer.value !== ""
          ? highlightedCardIndex.value
          : getRandomInt(0, props.myAnswerCards.length);

      highlightedCardIndex.value = null;
      isAnswerSelected.value = true;

      context.emit("answerSelected", {
        ...props.myAnswerCards[cardIndex],
        cardIndex,
        sender: store.state.myId,
      });
    };

    const selectAnswer = (card, index) => {
      if (isAnswerSelected.value) return;

      if (highlightedCardIndex.value === null) {
        return (highlightedCardIndex.value = index);
      }

      if (highlightedCardIndex.value !== null && !props.selectable) {
        return (highlightedCardIndex.value = null);
      }

      if (
        highlightedCardIndex !== null &&
        highlightedCardIndex.value !== index
      ) {
        highlightedCardIndex.value = null;
        customAnswerEditMode.value = false;
        return;
      }

      highlightedCardIndex.value = null;
      isAnswerSelected.value = true;

      context.emit("answerSelected", { ...card, sender: store.state.myId });

      customAnswer.value = "";
    };

    const customAnswerEditMode = ref(false);
    const customAnswer = ref("");

    const selectCustomAnswer = (card, index) => {
      if (isAnswerSelected.value) return;

      if (highlightedCardIndex.value === null) {
        highlightedCardIndex.value = index;

        if (props.selectable && customAnswer.value === "") {
          customAnswerEditMode.value = true;
        }

        return;
      }

      if (highlightedCardIndex.value !== null && !props.selectable) {
        return (highlightedCardIndex.value = null);
      }

      if (
        highlightedCardIndex !== null &&
        highlightedCardIndex.value !== index
      ) {
        return (highlightedCardIndex.value = null);
      }

      if (customAnswer.value === "") {
        customAnswerEditMode.value = true;
        return;
      }

      highlightedCardIndex.value = null;
      isAnswerSelected.value = true;

      context.emit("answerSelected", {
        customAnswer: true,
        answer: customAnswer.value,
        sender: store.state.myId,
      });

      customAnswer.value = "";
      customAnswerEditMode.value = false;
    };

    function confirmCustomAnswer(answer) {
      customAnswer.value = answer;
      customAnswerEditMode.value = false;
    }

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
      selectAnswer,
      highlightedCardIndex,
      isAnswerSelected,
      cardNumberClass,
      highlightedClass,
      darkenedClass,
      selectCustomAnswer,
      customAnswerEditMode,
      confirmCustomAnswer,
    };
  },
};
</script>

<style scoped lang="scss">
#hand-container {
  position: static;
  grid-template: 1fr / 1fr 1fr;
  max-width: 380px;
  margin: auto;
  justify-items: center;
  perspective: 600px;
  align-items: end;

  .answer-card {
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
    margin-bottom: 10em;
  }

  .card-1 {
    grid-area: 1 / 1 / 2 / 2;
    margin-bottom: 7em;
  }

  .card-2 {
    grid-area: 1 / 1 / 2 / 2;
    margin-bottom: 4em;
  }

  .card-3 {
    grid-area: 1 / 1 / 2 / 2;
    margin-bottom: 1em;
  }

  .card-4 {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: 10em;
  }

  .card-5 {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: 7em;
  }

  .card-6 {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: 4em;
  }

  .card-7 {
    grid-area: 1 / 2 / 2 / 3;
    margin-bottom: 1em;
  }
}
</style>
