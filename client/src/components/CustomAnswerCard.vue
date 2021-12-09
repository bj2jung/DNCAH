<template>
  <div
    id="customAnswerCard"
    class="p-2 w-40 h-52 font-semibold rounded-lg shadow-lg"
  >
    <teleport to="#modal">
      <CustomAnswerModal :showModal="showModal" @close="showModal = false">
        <input v-model="customAnswerModel" type="text" />
        <button
          @click="
            showModal = false;
            confirmCustomAnswer();
          "
        >
          <img
            style="width: 1.3em; height: 1.3em; display:inline; margin-left: 0.5em; filter: invert(100%)"
            src="../assets/check.png"
          />
        </button>
      </CustomAnswerModal>
    </teleport>
    <button @click.stop="showModal = true">
      <img
        style="width: 1.3em; height: 1.3em; display:inline; margin-right: 0.2em"
        src="../assets/edit.png"
      />
    </button>
    {{ customAnswerModel === "" ? "Custom answer..." : customAnswerModel }}
  </div>
</template>

<script>
import CustomAnswerModal from "@/components/CustomAnswerModal";
import { ref, toRefs } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
export default {
  components: { CustomAnswerModal },
  props: ["editMode", "isAnswerSelected"],
  emits: ["confirmCustomAnswer"],
  setup(props, context) {
    const { editMode, isAnswerSelected } = toRefs(props);
    const showModal = ref(false);
    const customAnswerModel = ref("");

    watch(editMode, () => {
      if (editMode.value) showModal.value = true;
    });

    watch(isAnswerSelected, () => {
      if (isAnswerSelected.value) {
        customAnswerModel.value = "";
      }
    });

    function confirmCustomAnswer() {
      context.emit("confirmCustomAnswer", customAnswerModel.value);
    }

    return {
      customAnswerModel,
      showModal,
      confirmCustomAnswer,
    };
  },
};
</script>

<style scoped lang="scss">
#customAnswerCard {
  background-color: #fdfdfd;
  border-width: 3px;
  border-color: #787878;
  text-align: left;

  span {
    &.unrevealed {
      display: none;
    }
  }
}
</style>
