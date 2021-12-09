<template>
  <div class="bg-black h-screen text-center">
    <transition appear name="title">
      <div class="p-6 text-5xl text-left text-white font-bold tracking-wide">
        <div>Definitely</div>
        <div>Not</div>
        <div>Cards</div>
        <div>Against</div>
        <div>Humanity</div>
      </div>
    </transition>
    <transition appear name="start-lobby-button">
      <button
        class="mt-32 inline-block px-4 pb-4 pt-3 bg-black rounded-lg text-white font-bold tracking-wide text-lg action-button"
        v-on:click="startLobby()"
      >
        Start Lobby
      </button>
    </transition>
    <div v-if="somethingWentWrong" class="mt-6 text-lg text-white font-bold">
      Uh oh. Something went wrong. Try again later?
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ref } from "@vue/reactivity";

export default {
  setup() {
    const router = useRouter();
    const store = useStore();

    const startLobby = async () => {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_ROOT_API}connection`
        );
        router.push({ path: `/lobby/${response.data}` });
        store.commit("makeHost");
      } catch (error) {
        somethingWentWrong.value = true;
        console.log("something went wrong", error);
      }
    };

    const somethingWentWrong = ref(false);

    return { startLobby, somethingWentWrong };
  },
};
</script>

<style lang="scss" scoped>
.title-enter-from {
  transform: translateY(100vh);
}

.title-enter-active {
  transition: all 0.8s ease;
}

.start-lobby-button-enter-from {
  transform: translateY(100vh);
}

.start-lobby-button-enter-active {
  transition: all 1.3s ease;
}
</style>
