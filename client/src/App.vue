<template>
  <div
    class="font-sans select-none mx-0 md:mx-10 lg:mx-32 fixed-width"
    id="main-container"
    :style="{ width: $store.state.gameWidth }"
  >
    <router-view v-slot="{ Component }">
      <transition name="slide-router-transition" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const onWidthChange = () => {
      store.commit("setWindowWidth", window.innerWidth);
    };

    onMounted(() => {
      onWidthChange();
      window.addEventListener("resize", onWidthChange);
    });
  },
};
</script>

<style>
#main-container {
  overflow: hidden;
  position: fixed;
  height: 100%;
}

@media (min-width: 1536px) {
  .fixed-width {
    width: 88rem;
    left: 0;
    right: 0 !important;
    margin: 0 auto !important;
  }
}

*::-webkit-scrollbar {
  display: none;
}

@keyframes tap {
  0% {
    transform: scale(0.97);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 0;
  }

  25% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes card-drop {
  0% {
    transform: scale(10);
  }

  45% {
    transform: scale(1);
  }

  60% {
    transform: scale(1.2);
  }

  75% {
    transform: scale(1);
  }

  85% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes card-drop-and-lean {
  0% {
    transform: scale(10);
  }

  45% {
    transform: scale(1) rotateX(4deg);
  }

  60% {
    transform: scale(1.2) rotateX(6deg);
  }

  75% {
    transform: scale(1) rotateX(7deg);
  }

  85% {
    transform: scale(1.02) rotateX(8deg);
  }

  100% {
    transform: scale(1) rotateX(10deg);
  }
}

.action-button {
  border: 3px solid white;
}

.slide-router-transition-enter-from {
  transform: translateY(100vh);
}

.slide-router-transition-leave-to {
  transform: translateY(100vh);
}

.slide-router-transition-enter-active,
.slide-router-transition-leave-active {
  transition: all 0.3s ease;
}
</style>
