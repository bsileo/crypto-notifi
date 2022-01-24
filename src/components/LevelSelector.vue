<template>
  <div class="pl-2">
    <va-radio
      v-for="option in levelOptions"
      :key="option"
      v-model="level"
      :option="option"
    >
      {{ option }}
    </va-radio>
    <va-popover
      placement="right"
      message="Select the user level required to subscribe to this category"
      ><va-icon class="mb-3" name="info" />
    </va-popover>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return { };
  },
  data() {
    return {
      intLevel: "",
    };
  },
  emits: ["changed"],
  computed: {
    levelOptions(): string[] {
      return ["Free", "Basic", "Gold"];
    },
    level: {
      get(): string {
        return this.intLevel;
      },
      set(newVal: string): void {
        this.intLevel = newVal;
        this.$emit("changed", newVal);
      },
    },
  },
});
</script>
