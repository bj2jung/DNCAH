<template>
  <div id="scoreboard" class="m-auto px-8 pb-4 pt-2 rounded-lg shadow-lg">
    <div class="text-xl font-bold tracking-wide">Scoreboard</div>
    <div id="scoreboard-grid" class="grid mt-2 text-md font-medium">
      <template
        v-for="player in playerListSortedByPoints"
        :key="player.playerId"
      >
        <div class="cell text-center">
          {{ player.playerNickname }}
        </div>
        <div class="cell text-left">
          <span>
            {{ player.score }}
          </span>
          <span v-if="player.playerId == roundWinnerId">
            <img
              style="width: 1.3em; height: 1.3em; display:inline; margin-left: 1em"
              src="../assets/check.png"
            />
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

export default {
  props: ["roundWinnerId"],
  setup() {
    const store = useStore();

    const playerListSortedByPoints = computed(() => {
      return [...store.state.playerListOrdered].sort(
        (a, b) => b.score - a.score
      );
    });

    return {
      playerListSortedByPoints,
    };
  },
};
</script>

<style lang="scss" scoped>
#scoreboard {
  width: 90%;
  min-width: 300px;
  max-width: 600px;
  background-color: white;
}

#scoreboard-grid {
  grid-template: 1fr / 80% 20%;
}

.cell {
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);

  &.left {
    text-align: center;
  }

  &.right {
    text-align: center;
  }
}
</style>
