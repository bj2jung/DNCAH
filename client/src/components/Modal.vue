<template>
  <transition name="overlay">
    <div v-if="showModal" class="modal-overlay" @click="$emit('close')">
      <transition name="content" appear>
        <div v-if="showModal">
          <slot></slot>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Modal",
  emits: ["close"],
  props: ["showModal"],
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.overlay-enter-from {
  opacity: 0;
}

.overlay-enter-active {
  transition: opacity 0.3s ease;
}

.content-enter-from {
  transform: translateY(-50vh);
}

.content-enter-active {
  transition: transform 0.3s ease;
}
</style>
