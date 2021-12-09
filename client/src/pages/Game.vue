<template>
  <div class="bg-black h-screen" style="width: inherit">
    <GameController v-if="!isGameCancelled" :payload="payload" />
    <div v-if="isGameCancelled">
      <div class="mx-1 mb-1 text-white font-bold tracking-wide text-lg">
        Oh no. Someone disconnected.
      </div>
      <div class="my-2">
        <GameSummary />
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { onBeforeRouteLeave } from "vue-router";
import { ref } from "@vue/reactivity";
import GameController from "@/components/GameController";
import GameSummary from "@/components/GameSummary";
import { onBeforeUnmount, onMounted, watch } from "@vue/runtime-core";

export default {
  setup() {
    const store = useStore();
    const payload = ref(null);
    const isGameCancelled = ref(false);

    watch(isGameCancelled, (isGameCancelled) => {
      if (isGameCancelled) window.onbeforeunload = null;
    });

    onMounted(() => {
      window.onbeforeunload = listener;
    });

    onBeforeUnmount(() => {
      window.onbeforeunload = null;
    });

    onBeforeRouteLeave(() => {
      if (store.state.isGameInProgress) {
        const answer = window.confirm("Leave game?");

        if (!answer) return false;

        store.state.connections.forEach((connection) => connection.close());
      }
    });

    const listener = function() {
      return "Do you want to exit this page?";
    };

    // Set up listeners and data relaying for host
    store.state.connections.forEach((connection) => {
      connection.on("data", (data) => {
        store.state.isHost && sendData(data);

        if (data.type === "game") {
          payload.value = data;
          return;
        }

        gameProgressLogic(data);
      });

      connection.on("close", () => {
        if (store.state.isGameInProgress) {
          store.state.isHost &&
            sendData({
              type: "player",
              action: "playerLeft",
            });

          store.commit("setIsGameInProgress", false);

          isGameCancelled.value = true;
        }
      });
    });

    const gameProgressLogic = (data) => {
      if (data.action === "playerLeft") {
        store.commit("setIsGameInProgress", false);
        isGameCancelled.value = true;
      }
    };

    const sendData = (data) => {
      store.state.connections.forEach((connection) => {
        connection.send(data);
      });
    };

    return {
      payload,
      isGameCancelled,
    };
  },
  components: {
    GameController,
    GameSummary,
  },
};
</script>
