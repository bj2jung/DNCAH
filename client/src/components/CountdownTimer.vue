<template>
  <div class="base-timer">
    <svg
      class="base-timer__svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="base-timer__circle">
        <circle
          class="base-timer__path-elapsed"
          cx="50"
          cy="50"
          r="35"
        ></circle>
        <path
          :stroke-dasharray="circleDasharray"
          class="base-timer__path-remaining"
          :class="remainingPathColor"
          d="
            M 50, 50
            m -35, 0
            a 35,35 0 1,0 70,0
            a 35,35 0 1,0 -70,0
          "
        ></path>
      </g>
    </svg>
  </div>
</template>

<script>
const FULL_DASH_ARRAY = 210;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green",
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD,
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD,
  },
};

export default {
  data() {
    return {
      timePassed: 0,
      timerInterval: null,
    };
  },

  emits: ["timesUp"],

  props: ["resetTimer"],

  computed: {
    circleDasharray() {
      return `${(this.timeFraction * FULL_DASH_ARRAY).toFixed(0)} 283`;
    },

    timeLeft() {
      return this.$store.state.gameSettings.waitTime - this.timePassed;
    },

    timeFraction() {
      const rawTimeFraction =
        this.timeLeft / this.$store.state.gameSettings.waitTime;
      return (
        rawTimeFraction -
        (1 / this.$store.state.gameSettings.waitTime) * (1 - rawTimeFraction)
      );
    },

    remainingPathColor() {
      const { alert, warning, info } = COLOR_CODES;

      if (this.timeLeft <= alert.threshold) {
        return alert.color;
      } else if (this.timeLeft <= warning.threshold) {
        return warning.color;
      } else {
        return info.color;
      }
    },
  },

  watch: {
    timeLeft(newValue) {
      if (newValue === 0) {
        this.onTimesUp();
      }
    },
  },

  mounted() {
    this.startTimer();
  },

  methods: {
    onTimesUp() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.$emit("timesUp");
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timePassed = 0;
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
    },
  },
};
</script>

<style scoped lang="scss">
.base-timer {
  position: relative;
  width: 100%;
  height: 100%;

  &__svg {
    transform: scaleX(-1);
  }

  &__circle {
    fill: none;
    stroke: none;
  }

  &__path-elapsed {
    stroke-width: 12px;
    stroke: lightgrey;
  }

  &__path-remaining {
    stroke-width: 12px;
    stroke-linecap: round;
    transform: rotate(90deg);
    transform-origin: center;
    transition: 1s linear all;
    fill-rule: nonzero;
    stroke: currentColor;

    &.green {
      color: rgb(65, 184, 131);
    }

    &.orange {
      color: orange;
    }

    &.red {
      color: red;
    }
  }
}
</style>
