<template>
  <div class="flex xs2"><strong>Frequency:</strong></div>
  <div class="flex xs8">
    <va-radio
      v-for="(option, index) in options"
      :key="index"
      v-model="selectedOption"
      :option="option[0]"
      >{{ option[1] }}</va-radio
    >
  </div>
</template>

<script setup lang="ts">
import { UserFrequency } from "@/notifi_types";
import { computed, ref } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps(["modelValue", "subscription"]);

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);

const selectedOption = computed({
  get() {
    return props.modelValue;
  },
  set(value: typeof UserFrequency) {
    emit("update:modelValue", value);
  },
});
const options = ref(Object.entries(UserFrequency));
</script>
