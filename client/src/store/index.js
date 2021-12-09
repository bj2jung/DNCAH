import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      isIOS: false,
      isHost: false,
      myId: null,
      connections: [],
      playerListOrdered: [],
      onMobile: null,
      gameWidth: null,
      gameSettings: null,
      isMyTurn: false,
      isMyAction: false,
      isGameInProgress: false,
    };
  },
  mutations: {
    setIsIOS(state) {
      state.isIOS = state;
    },
    makeHost(state) {
      state.isHost = true;
    },
    setMyId(state, id) {
      state.myId = id;
    },
    addConnection(state, connection) {
      state.connections.push(connection);
    },
    setPlayerListOrdered(state, playerListOrdered) {
      state.playerListOrdered = playerListOrdered;
    },
    rewardPointToPlayer(state, playerId) {
      const playerIndex = state.playerListOrdered.findIndex(
        (player) => player.playerId === playerId
      );
      state.playerListOrdered[playerIndex].score += 1;
    },

    setGameSettings(state, gameSettings) {
      state.gameSettings = { ...gameSettings };
    },

    setWindowWidth(state, windowWidth) {
      if (windowWidth < 640) {
        state.onMobile = true;
      } else {
        state.onMobile = false;
      }

      let gameWidth;

      if (windowWidth >= 1536) {
        gameWidth = "88rem";
      } else if (windowWidth >= 1024) {
        gameWidth = `${windowWidth - 16 * 16}px`;
      } else if (windowWidth >= 768) {
        gameWidth = `${windowWidth - 16 * 5}px`;
      } else {
        gameWidth = `${windowWidth}px`;
      }

      state.gameWidth = gameWidth;
    },
    setIsMyTurn(state, isMyTurn) {
      state.isMyTurn = isMyTurn;
    },
    setIsMyAction(state, isMyAction) {
      state.isMyAction = isMyAction;
    },

    setIsGameInProgress(state, isInProgress) {
      state.isGameInProgress = isInProgress;
    },
  },
});
