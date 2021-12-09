<template>
  <div>
    <div v-if="winner" class="mb-6 text-center">
      <div class="text-white font-bold tracking-wide text-lg">
        WINNER: {{ winner.playerNickname }}
      </div>
    </div>
    <Scoreboard />
    <div class="mt-4 text-center">
      <router-link to="/">
        <button
          class="mx-1 inline-block px-4 pb-4 pt-3 bg-black rounded-lg shadow-lg text-white font-bold tracking-wide text-lg action-button"
        >
          Back to main page
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import Scoreboard from "@/components/Scoreboard";

export default {
  props: ["winner"],
  components: { Scoreboard },
};
</script>
