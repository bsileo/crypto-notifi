<template>
  <va-select
    :options="chains"
    :label="label"
    v-model="selected"
    @update:model-value="select"
    :multiple="false"
    :messages="messages"
    :success="valid"
  ></va-select>
</template>

<script setup lang="ts">
import { Chain } from "@/models/Contract";
import { computed, ref } from "vue";
import { Protocol } from "@/models/Protocol";
import { useContractsStore } from "@/store/pinia_contracts";

// eslint-disable-next-line no-undef
const emit = defineEmits(["selected"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  multiple: Boolean,
  required: Boolean,
  protocol: Protocol,
  selectedChain: String,
});
const valid = computed(() => {
  return !props.required || selected.value != undefined;
});
const selected = ref<Chain>(props.selectedChain as Chain);
const label = "Chain";
const messages = props.required ? "Required" : "";

const contractsStore = useContractsStore();
let initialChains: Chain[] = contractsStore.chains;
if (props.protocol && props.protocol.chains) {
  // eslint-disable-next-line vue/no-setup-props-destructure
  initialChains = props.protocol.chains;
}
const chains = ref<Chain[]>(initialChains);

const select = (chain: Chain) => {
  emit("selected", chain);
};
</script>
