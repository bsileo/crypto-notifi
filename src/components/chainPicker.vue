<template>
  <va-select
    :options="chains"
    :label="label"
    v-model="selected"
    @update:model-value="select"
    :multiple="multiple"
    :messages="messages"
    :success="selected.length > 0"
  ></va-select>
</template>

<script setup lang="ts">
import { Chain } from "@/models/Contract";
import { ref } from "vue";
// eslint-disable-next-line no-undef
const emit = defineEmits(["selected"]);
// eslint-disable-next-line no-undef
const props = defineProps({ multiple: Boolean, required: Boolean });
const selected = ref<Chain[]>([]);
const label = props.multiple ? "Chains" : "Chain";
const messages = props.required ? "Required" : "";
const chains = ref<Chain[]>(["avalanche", "eth"]);
const select = (chains: Chain) => {
  emit("selected", selected.value);
};
</script>
