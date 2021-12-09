<template>
  <div id="lobby-container" class="bg-black text-center">
    <div v-if="!roomIsFull">
      <div id="header">
        <div
          class="inline-block mx-1 mb-1 text-white font-bold tracking-wide text-lg justify-self-start"
        >
          Lobby
        </div>
        <div
          class="inline-block mx-1 mb-1 text-white font-bold tracking-wide text-lg justify-self-end"
        >
          <input
            v-if="!isNicknameConfirmed"
            v-model="nicknameModel"
            id="nicknameInput"
            placeholder="Enter Nickname"
            maxlength="25"
            type="text"
            style="padding-left: 0.5em"
          />
          <span v-if="isNicknameConfirmed">
            {{ confirmedNickname }}
          </span>
          <img
            v-if="!isNicknameConfirmed"
            @click="changeNickname"
            :disabled="!!!nicknameModel"
            style="width: 1.3em; height: 1.3em; display:inline; margin-left: 0.5em; filter: invert(100%)"
            src="../assets/check.png"
          />
          <img
            @click="isNicknameConfirmed = false"
            v-if="isNicknameConfirmed"
            style="width: 1.3em; height: 1.3em; display:inline; margin-left: 0.5em; filter: invert(100%)"
            src="../assets/edit.png"
          />
        </div>
      </div>

      <div class="my-4 text-white perspective">
        <div
          class="inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white max-w-full lobby-section rotate"
        >
          <div class="font-bold mb-2 tracking-wide text-lg">
            Game Settings
          </div>

          <div>
            <input
              id="asdf"
              type="checkbox"
              :disabled="!$store.state.isHost"
              @change="onUpdateCustomAnswers"
              v-model="customAnswersModel"
            />
            <label class="ml-2" for="asdf">Custom Answers</label>
          </div>

          <div>
            Points to win
          </div>
          <div>
            <input
              :disabled="!$store.state.isHost"
              v-model="pointsToWinModel"
              @change="onUpdatePointsToWin"
              type="range"
              :min="3"
              :max="maxPointsToWin"
            />
            <span>{{ pointsToWinModel }}</span>
          </div>

          <div>
            Wait time per turn
          </div>
          <div>
            <input
              :disabled="!$store.state.isHost"
              v-model="waitTimeModel"
              @change="onUpdateWaitTime"
              type="range"
              :min="25"
              :max="45"
            />
            <span>{{ waitTimeModel }} s</span>
          </div>

          <div>
            Game duration:
            {{
              3 > lobbyPlayerList.length
                ? "Need at least 3 players"
                : `~${estimatedGameDuration} min`
            }}
          </div>
        </div>
      </div>

      <div class="my-4 perspective">
        <div
          id="players-in-lobby-container"
          class="inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white max-w-full lobby-section rotate"
        >
          <div class="font-bold mb-1 tracking-wide text-lg">
            {{ lobbyPlayerList.length }} Players in Lobby (max 8)
          </div>
          <div class="text-left">
            <li
              class="truncate"
              v-for="player of lobbyPlayerList"
              :key="player.playerId"
            >
              {{ player.playerNickname }}
            </li>
          </div>
        </div>
      </div>

      <div class="my-4 perspective">
        <div
          id="packs-container"
          class="inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white max-w-full lobby-section rotate"
        >
          <div class="font-bold mb-1 tracking-wide text-lg text-center">
            Packs
          </div>
          <div class="text-left">
            <div v-for="pack of packsList" :key="pack._id">
              <input
                type="radio"
                :disabled="!$store.state.isHost"
                :id="pack.pack"
                :value="pack.pack"
                v-model="packsModel"
                @change="onUpdateSelectedPack"
              />
              <label :for="pack.pack">{{ pack.pack }}</label>
            </div>
          </div>
        </div>
      </div>

      <div class="my-4">
        <button
          class="mx-1 inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white font-bold tracking-wide text-lg action-button"
          @click="onClickInvite"
        >
          Invite
        </button>
        <button
          class="mx-1 inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white font-bold tracking-wide text-lg action-button"
          :disabled="lobbyPlayerList.length < 3"
          :class="{ 'button-disabled': lobbyPlayerList.length < 3 }"
          v-if="$store.state.isHost"
          @click="hostStartGame"
        >
          Start
        </button>
      </div>

      <div
        class="inline-block text-white font-bold"
        v-if="showLinkCopiedMessage"
      >
        Link Copied
      </div>
    </div>
    <div
      v-else
      class="inline-block mx-1 mb-1 text-white font-bold tracking-wide text-lg"
    >
      Uh oh. Room is full.
    </div>
  </div>
</template>

<script>
import Peer from "peerjs";
import io from "socket.io-client";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { useStore } from "vuex";
import { watch } from "@vue/runtime-core";
import { fetchPacksApi } from "@/api/cards";
import { computed } from "@vue/reactivity";

export default {
  setup() {
    const socket = io(process.env.VUE_APP_ROOT_API);
    const myPeer = new Peer(null, {
      debug: 2,
    });
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const lobbyPlayerList = ref([]);
    const nicknameModel = ref(localStorage.getItem("nickname") || "");
    const confirmedNickname = ref(localStorage.getItem("nickname") || "");
    const isNicknameConfirmed = ref(localStorage.getItem("nickname") !== null);
    const playerCount = ref(1);
    const customAnswersModel = ref(true);
    const pointsToWinModel = ref(4);
    const waitTimeModel = ref(30);
    const roomIsFull = ref(false);
    const showLinkCopiedMessage = ref(false);
    const joinedSocket = ref(false);

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) store.commit("setIsIOS", true);

    const estimatedGameDuration = computed(() => {
      const minutes =
        (((pointsToWinModel.value * lobbyPlayerList.value.length) / 2) *
          4 *
          waitTimeModel.value) /
        60;

      return Math.ceil(minutes / 5) * 5;
    });

    onBeforeRouteLeave(() => {
      socket.disconnect();
    });

    // run myPeer to get an id, then join socket room
    myPeer.on("open", (id) => {
      store.commit("setMyId", id);

      store.state.isHost &&
        lobbyPlayerList.value.push({
          playerId: id,
          playerNickname:
            localStorage.getItem("nickname") || `Player ${playerCount.value}`,
          isHost: true,
        });

      playerCount.value += 1;
      socket.emit("join-room", route.params.id, id, nicknameModel.value);
      joinedSocket.value = true;
    });

    // For host of room. Send connection request to new user
    store.state.isHost &&
      socket.on("someone-joined-room", (playerId, socketId, nickname) => {
        if (lobbyPlayerList.value.length < 8) {
          onUpdateCustomAnswers();
          onUpdatePointsToWin();
          onUpdateWaitTime();
          onUpdateSelectedPack();

          const conn = myPeer.connect(playerId);

          store.commit("addConnection", conn);

          lobbyPlayerList.value.push({
            playerId,
            playerNickname: nickname || `Player ${playerCount.value}`,
            socketId,
          });
          playerCount.value += 1;

          setTimeout(() => {
            sendData({
              action: "sendLobbyDetails",
              payload: {
                packsList: packsList.value,
                lobbyPlayerList: lobbyPlayerList.value,
              },
            });
          }, 1500);
        } else {
          socket.emit("roomFull", playerId);
        }
      });

    // For guest of room. listen to connection request from other browser
    !store.state.isHost &&
      myPeer.on("connection", (conn) => {
        conn.on("open", function() {
          store.commit("addConnection", conn);

          // Receive messages
          conn.on("data", function(data) {
            if (data.action === "sendLobbyDetails") {
              if (!packsList.value.length)
                packsList.value = data.payload.packsList;
              lobbyPlayerList.value = data.payload.lobbyPlayerList;
            }

            if (data.action === "gameStart") {
              store.commit("setIsGameInProgress", true);

              store.commit(
                "setPlayerListOrdered",
                data.payload.playerListOrdered
              );
              store.commit("setGameSettings", data.payload.gameSettings);

              router.push({ path: `/game/cah` });
              socket.disconnect();
            }
          });
        });
      });

    socket.on("room-full", (userId) => {
      if (store.state.myId === userId) {
        roomIsFull.value = true;
        socket.disconnect();
      }
    });

    socket.on("someone-changed-nickname", (userId, nickname) => {
      lobbyPlayerList.value.find(
        (player) => player.playerId == userId
      ).playerNickname = nickname;
    });

    socket.on("custom-answers-updated", (allow) => {
      customAnswersModel.value = allow;
    });

    socket.on("points-to-win-updated", (points) => {
      pointsToWinModel.value = points;
    });

    socket.on("wait-time-updated", (seconds) => {
      waitTimeModel.value = seconds;
    });

    socket.on("selected-pack-updated", (pack) => {
      packsModel.value = pack;
    });

    socket.on("someone-disconnected", (playerId) => {
      if (
        lobbyPlayerList.value.find((player) => player.playerId == playerId)
          ?.isHost
      ) {
        // Host left the room
        router.push({ path: "/" });
        return;
      }

      const indexOfPlayerThatLeft = lobbyPlayerList.value.findIndex(
        (player) => player.playerId == playerId
      );

      if (indexOfPlayerThatLeft > 0) {
        lobbyPlayerList.value.splice(indexOfPlayerThatLeft, 1);
      }
    });

    const hostStartGame = () => {
      const playerListOrdered = playerListInitialize(lobbyPlayerList.value);
      const gameSettings = {
        customAnswers: customAnswersModel.value,
        pointsToWin: pointsToWinModel.value,
        waitTime: waitTimeModel.value,
        pack: packsModel.value,
      };

      store.commit("setIsGameInProgress", true);

      store.commit("setPlayerListOrdered", playerListOrdered);

      store.commit("setGameSettings", gameSettings);

      sendData({
        action: "gameStart",
        payload: {
          playerListOrdered,
          gameSettings,
        },
      });

      router.push({ path: `/game/${route.params.id}` });

      socket.disconnect();
    };

    const sendData = (data) => {
      store.state.connections.forEach((connection) => {
        connection.send(data);
      });
    };

    const playerListInitialize = (arr) => {
      return arr
        .map((player) => ({
          playerId: player.playerId,
          playerNickname: player.playerNickname,
          sort: Math.random(),
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ playerId, playerNickname }, index) => ({
          playerId,
          playerNickname,
          order: index,
          score: 0,
        }));
    };

    const changeNickname = () => {
      isNicknameConfirmed.value = true;
      confirmedNickname.value = nicknameModel.value;

      localStorage.setItem("nickname", confirmedNickname.value);

      socket.emit("changeNickname", store.state.myId, confirmedNickname.value);

      lobbyPlayerList.value.find(
        (player) => player.playerId == store.state.myId
      ).playerNickname = confirmedNickname.value;
    };

    const onUpdateCustomAnswers = () => {
      socket.emit("updateCustomAnswers", customAnswersModel.value);
    };

    const onUpdatePointsToWin = () => {
      socket.emit("updatePointsToWin", pointsToWinModel.value);
    };

    const onUpdateWaitTime = () => {
      socket.emit("updateWaitTime", waitTimeModel.value);
    };

    const onClickInvite = () => {
      if (navigator.share) {
        navigator
          .share({
            title: "Let's play dnCAH!",
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);

        showLinkCopiedMessage.value = true;
        setTimeout(() => {
          showLinkCopiedMessage.value = false;
        }, 2000);
      }
    };

    // Handle fetching and displaying card packs
    const packsList = ref([]);
    const packsModel = ref("CAH & Expansions");

    store.state.isHost && getCardPacksList();

    async function getCardPacksList() {
      packsList.value = await fetchPacksApi();
    }

    const onUpdateSelectedPack = () => {
      socket.emit("updateSelectedPack", packsModel.value);
    };

    // Maximum allowable points to win
    const maxPointsToWin = computed(() => {
      if (lobbyPlayerList.value.length > 7) return 3;
      if (lobbyPlayerList.value.length > 5) return 4;
      if (lobbyPlayerList.value.length > 3) return 5;

      return 7;
    });

    store.state.isHost &&
      watch(
        lobbyPlayerList,
        () => {
          if (pointsToWinModel.value > maxPointsToWin.value) {
            pointsToWinModel.value = maxPointsToWin.value;
            onUpdatePointsToWin();
          }
        },
        { deep: true }
      );

    return {
      hostStartGame,
      lobbyPlayerList,
      nicknameModel,
      confirmedNickname,
      changeNickname,
      isNicknameConfirmed,
      customAnswersModel,
      pointsToWinModel,
      waitTimeModel,
      onUpdateCustomAnswers,
      onUpdatePointsToWin,
      onUpdateWaitTime,
      roomIsFull,
      estimatedGameDuration,
      onClickInvite,
      showLinkCopiedMessage,
      packsList,
      packsModel,
      onUpdateSelectedPack,
      maxPointsToWin,
    };
  },
};
</script>

<style lang="scss" scoped>
#lobby-container {
  height: 100%;
  overflow-y: scroll;
}

#header {
  display: grid;
  grid-template: 1fr / 1fr 3fr;
}

#nicknameInput {
  border: 1px solid black;
  color: black;
  max-width: 180px;
}

#players-in-lobby-container {
  max-height: 120px;
  overflow-y: scroll;
}

#packs-container {
  max-height: 160px;
  overflow-y: scroll;
}

.lobby-section {
  min-width: 300px;
  border: 3px solid white;
}

.rotate {
  transform: rotateX(10deg);
}

.perspective {
  perspective: 600px;
}

.button-disabled {
  background-color: grey;
}

::-webkit-scrollbar {
  display: block;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: grey;
  border-radius: 10px;
}

input[type="radio"]:checked:after {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  top: -2px;
  left: -2px;
  position: relative;
  background-color: #0075ff;
  content: "";
  display: inline-block;
  visibility: visible;
  border: 2px solid white;
}
</style>
