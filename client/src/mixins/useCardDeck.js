import { ref } from "vue";
import { shuffle } from "@/utils/shuffle";
import { useStore } from "vuex";
import { fetchCardsApi } from "@/api/cards";

export default function() {
  const store = useStore();

  const questionCardsShuffled = ref([]);

  const questionCardDeckPosition = ref(0);

  const dealCards = (type, numCards) => {
    const deck =
      type === "question" ? questionCardsShuffled : answerCardsShuffled;
    const position =
      type === "question" ? questionCardDeckPosition : answerCardDeckPosition;

    const cardsDealt = deck.value.slice(
      position.value,
      position.value + numCards
    );

    position.value += numCards;

    return cardsDealt;
  };

  const answerCardsShuffled = ref([]);

  const answerCardDeckPosition = ref(0);

  const fetchCards = async (cardType, numCards) => {
    return await fetchCardsApi(
      cardType,
      numCards,
      store.state.gameSettings.pack
    );
  };

  const initializeDecks = async () => {
    const questionCards = await fetchCards(
      "questions",
      getNeededQuestionCardsCount()
    );

    questionCardsShuffled.value = shuffle(questionCards);

    const answerCards = await fetchCards(
      "answers",
      getNeededAnswerCardsCount()
    );

    answerCardsShuffled.value = shuffle(answerCards);

    return true;
  };

  function getDeckInfo() {
    return {
      availableQuestionCardsCount: questionCardsShuffled.value.length,
      questionCardsNeeded: getNeededQuestionCardsCount(),
      availableAnswerCardsCount: answerCardsShuffled.value.length,
      answerCardsNeeded: getNeededAnswerCardsCount(),
      maxNumberOfRounds: getMaxNumberOfRounds(),
    };
  }

  function getMaxNumberOfRounds() {
    return (
      (store.state.gameSettings.pointsToWin - 1) *
        store.state.playerListOrdered.length +
      1
    );
  }

  function getNeededQuestionCardsCount() {
    return getMaxNumberOfRounds() * 3;
  }

  function getNeededAnswerCardsCount() {
    return (
      store.state.playerListOrdered.length * 8 +
      getMaxNumberOfRounds() * (store.state.playerListOrdered.length - 1)
    );
  }

  return {
    initializeDecks,
    dealCards,
    getDeckInfo,
  };
}
