<template>
  <div id="game" @click="backgroundClick = !backgroundClick">
    <div>
      <div class="text-center mb-4" v-if="!gameStarted">
        <div class="text-white font-bold tracking-wide text-lg">
          Game starting in {{ gameStartCounter }}
        </div>
      </div>
      <div v-else>
        <StatusBar @times-up="onTimesUp" ref="statusBarRef" />
      </div>
    </div>

    <div>
      <div v-if="gameStarted">
        <div v-if="currentPhase === 0">
          <PhaseZero
            :questionCards="questionCards"
            @question-selected="questionSelected"
            :isFirstTurn="isFirstTurn"
            :timesUp="timesUp"
            :backgroundClick="backgroundClick"
          />
        </div>
        <div v-else-if="currentPhase === 1">
          <PhaseOne :currentQuestion="currentQuestion" />
        </div>
        <div v-else-if="currentPhase === 2">
          <PhaseTwo
            :currentQuestion="currentQuestion"
            :currentAnswers="currentAnswers"
            :bestAnswer="bestAnswer"
            :revealedAnswer="revealedAnswer"
            @answer-revealed="answerRevealed"
            @best-answer-selected="bestAnswerSelected"
            :timesUp="timesUp"
            :backgroundClick="backgroundClick"
          />
        </div>
        <div v-else-if="currentPhase === 3">
          <PhaseThree
            :currentQuestion="currentQuestion"
            :bestAnswer="bestAnswer"
            @startNewTurn="startNewTurn"
          />
        </div>
      </div>
    </div>
  </div>
  <div id="hand-top-container">
    <transition name="slide">
      <div
        v-if="gameStarted"
        v-show="!$store.state.isMyTurn && currentPhase < 2"
        @click="backgroundClick = !backgroundClick"
      >
        <Hand
          :myAnswerCards="myAnswerCards"
          :timesUp="timesUp"
          :selectable="currentPhase === 1"
          @answer-selected="answerSelected"
          :backgroundClick="backgroundClick"
          :currentPhase="currentPhase"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import { onMounted, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import Hand from "@/components/Hand";
import PhaseZero from "@/components/PhaseZero";
import PhaseOne from "@/components/PhaseOne";
import PhaseTwo from "@/components/PhaseTwo";
import PhaseThree from "@/components/PhaseThree";
import StatusBar from "@/components/StatusBar";
import useCardDeck from "@/mixins/useCardDeck";
import { randomizeOrder } from "@/utils/randomizeOrder";

export default {
  components: { Hand, PhaseZero, PhaseOne, PhaseTwo, PhaseThree, StatusBar },
  props: ["payload"],
  watch: {
    payload(payload) {
      this.gameLogicFunction(payload);
    },

    hostPayload(payload) {
      this.gameLogicFunction(payload);
    },
  },

  setup() {
    const store = useStore();
    const gameStarted = ref(false);
    const gameStartCounter = ref(3);
    const hostPayload = ref(null); // For host only
    const showQuestion = ref(false);
    const currentPhase = ref(-1);
    const currentQuestion = ref(null);
    const currentAnswers = ref([]);
    const bestAnswer = ref(null);
    const currentTurn = ref(0);
    const myAnswerCards = ref([]);
    const questionCards = ref([]);
    const timesUp = ref(false);
    const statusBarRef = ref(null);
    const isFirstTurn = ref(true);
    const revealedAnswer = ref(null);

    const cardDeck = store.state.isHost ? useCardDeck() : null; // For host only

    /*
    Game phases:
    0: turn user select question
    1: other users select answer
    2. reveal answers / turn user select answer
    3. reward
    */

    onMounted(() => {
      gameStartTimer();
    });

    const gameLogicFunction = (data) => {
      switch (data.action) {
        case "sendAnswerCards":
          placeAnswerCardsInHand(data.payload);
          break;
        case "turnStart":
          turnStartFunction(data.payload);
          break;
        case "questionSelected":
          questionSelectedFunction(data.payload);
          break;
        case "answerSelected":
          answerSelectedFunction(data.payload);
          break;
        case "allAnswersSelected":
          allAnswersSelectedFunction(data.payload);
          break;
        case "answerRevealed":
          answerRevealedFunction(data.payload);
          break;
        case "bestAnswerSelected":
          bestAnswerSelectedFunction(data.payload);
          break;
        default:
          break;
      }
    };

    const gameStartTimer = () => {
      store.state.isHost && gameStartSetup();

      const startTimeInterval = setInterval(() => {
        if (gameStartCounter.value == 1) {
          clearInterval(startTimeInterval);
          gameStarted.value = true;

          store.state.isHost && turnStart();
        }

        gameStartCounter.value -= 1;
      }, 1000);
    };

    const gameStartSetup = async () => {
      await cardDeck.initializeDecks();
      setNumCardsForGame();
      dealCardsInitial();
    };

    const dealCardsInitial = async () => {
      const payload = {};

      store.state.playerListOrdered.forEach((player) => {
        payload[player.playerId] = cardDeck.dealCards(
          "answer",
          numAnswerCardsInHand.value
        );
      });

      sendData({
        type: "game",
        action: "sendAnswerCards",
        payload,
      });
    };

    const numQuestionCardsPerRound = ref(3);
    const numAnswerCardsInHand = ref(8);

    const setNumCardsForGame = () => {
      const cardDeckInfo = cardDeck.getDeckInfo();

      if (
        cardDeckInfo.availableQuestionCardsCount <
        cardDeckInfo.questionCardsNeeded
      ) {
        numQuestionCardsPerRound.value =
          (cardDeckInfo.availableQuestionCardsCount /
            cardDeckInfo.maxNumberOfRounds) |
          0;
      }

      if (
        cardDeckInfo.availableAnswerCardsCount < cardDeckInfo.answerCardsNeeded
      ) {
        numAnswerCardsInHand.value =
          ((cardDeckInfo.availableAnswerCardsCount -
            cardDeckInfo.maxNumberOfRounds *
              (store.state.playerListOrdered.length - 1)) /
            store.state.playerListOrdered.length) |
          0;
      }

      if (store.state.gameSettings.customAnswers) {
        numAnswerCardsInHand.value -= 1;
      }
    };

    const placeAnswerCardsInHand = (payload) => {
      if (payload[store.state.myId])
        myAnswerCards.value = myAnswerCards.value.concat(
          payload[store.state.myId]
        );
    };

    const turnStart = () => {
      sendData({
        type: "game",
        action: "turnStart",
        payload: {
          player:
            store.state.playerListOrdered[
              currentTurn.value % store.state.playerListOrdered.length
            ],
          questionCards: cardDeck.dealCards(
            "question",
            numQuestionCardsPerRound.value
          ),
        },
      });
    };

    const turnStartFunction = (payload) => {
      currentTurn.value += 1;

      if (payload.player.playerId === store.state.myId) {
        store.commit("setIsMyTurn", true);
        questionCards.value = [...payload.questionCards];
        setTimeout(() => {
          isFirstTurn.value = false;
        }, 10000);
      } else {
        store.commit("setIsMyTurn", false);
      }

      nextPhase();
    };

    const questionSelected = (option) => {
      sendData({
        type: "game",
        action: "questionSelected",
        payload: option,
      });
    };

    const questionSelectedFunction = (payload) => {
      currentQuestion.value = payload;

      nextPhase();
    };

    const answerSelected = (option) => {
      store.commit("setIsMyAction", false);

      sendData({
        type: "game",
        action: "answerSelected",
        payload: option,
      });
    };

    const answerSelectedFunction = (payload) => {
      // Remove selected answer card from my hand
      myAnswerCards.value = myAnswerCards.value.filter(
        (answerCard) => answerCard._id !== payload._id
      );

      if (store.state.isHost) {
        if (!payload.customAnswer) {
          // Send each player a new answer card for their hand
          const newCardPayload = {};
          newCardPayload[payload.sender] = cardDeck.dealCards("answer", 1);

          sendData({
            type: "game",
            action: "sendAnswerCards",
            payload: newCardPayload,
          });
        }

        // Gather all answers as the host
        currentAnswers.value.push({ ...payload, unrevealed: true });

        currentAnswers.value = randomizeOrder(currentAnswers.value);

        if (
          currentAnswers.value.length ===
          store.state.playerListOrdered.length - 1
        ) {
          setTimeout(() => {
            sendData({
              type: "game",
              action: "allAnswersSelected",
              payload: currentAnswers.value,
            });
          }, 500);
        }
      }
    };

    const allAnswersSelectedFunction = (payload) => {
      nextPhase();

      if (!store.state.isHost) {
        currentAnswers.value = payload;
      }
    };

    const answerRevealed = (answer) => {
      sendData({
        type: "game",
        action: "answerRevealed",
        payload: answer,
      });
    };

    const answerRevealedFunction = (payload) => {
      if (!store.state.isMyTurn) {
        revealedAnswer.value = payload.answer;
      } else {
        timesUp.value = false;
        statusBarRef.value.restartTimer();
      }
    };

    const bestAnswerSelected = (answer) => {
      sendData({
        type: "game",
        action: "bestAnswerSelected",
        payload: answer,
      });
    };

    const bestAnswerSelectedFunction = (payload) => {
      bestAnswer.value = payload;
      nextPhase();
    };

    const startNewTurn = () => {
      showQuestion.value = false;
      currentQuestion.value = null;
      currentAnswers.value = [];
      bestAnswer.value = null;

      store.state.isHost && turnStart();
    };

    const nextPhase = () => {
      timesUp.value = false;

      setTimeout(() => {
        currentPhase.value += 1;

        if (currentPhase.value === 4) {
          currentPhase.value = 0;
        }
      }, 500);
    };

    const onTimesUp = () => {
      timesUp.value = true;
    };

    const sendData = (data) => {
      store.state.connections.forEach((connection) => {
        connection.send(data);
      });

      if (store.state.isHost) hostPayload.value = data;
    };

    const backgroundClick = ref(true);

    return {
      gameStarted,
      gameStartCounter,
      questionSelected,
      showQuestion,
      currentPhase,
      currentQuestion,
      answerSelected,
      currentAnswers,
      answerRevealed,
      bestAnswerSelected,
      gameLogicFunction,
      bestAnswer,
      hostPayload,
      myAnswerCards,
      questionCards,
      onTimesUp,
      timesUp,
      statusBarRef,
      currentTurn,
      isFirstTurn,
      startNewTurn,
      revealedAnswer,
      backgroundClick,
    };
  },
};
</script>

<style scoped lang="scss">
#game {
  height: 100%;
  display: grid;
  grid-template-rows: 10% 40%;
  width: inherit;

  div {
    width: inherit;
  }
}

#hand-top-container {
  position: fixed;
  bottom: 0;
  width: inherit;
}

.slide-enter-from {
  transform: translateY(100vh);
}

.slide-leave-to {
  transform: translateY(100vh);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.8s ease;
}
</style>
