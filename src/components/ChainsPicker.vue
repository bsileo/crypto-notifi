<template>
  <va-select
    :options="chains"
    :label="label"
    v-model="selected"
    @update:model-value="select"
    multiple
    :messages="messages"
    :success="selected.length > 0"
  ></va-select>
</template>

<script setup lang="ts">
import { Chain } from "@/models/Contract";
import { ref } from "vue";
import { Protocol } from "@/models/Protocol";

// eslint-disable-next-line no-undef
const emit = defineEmits(["selected"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  multiple: Boolean,
  required: Boolean,
  protocol: Protocol,
  selectedChain: String,
});

const selected = ref<Chain[]>([]);
const label = "Chains";
const messages = props.required ? "Required" : "";
let initialChains: Chain[] = ["avalanche", "eth"];
if (props.protocol) {
  // eslint-disable-next-line vue/no-setup-props-destructure
  initialChains = props.protocol.chains;
}
const chains = ref<Chain[]>(initialChains);
const select = (chains: Chain) => {
  emit("selected", selected.value);
};
</script>
