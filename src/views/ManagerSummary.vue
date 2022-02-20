<template>
  <div>Analytics Coming Soon</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { fetchProtocol } from "@/composables/getProtocolByID";
import { Protocol } from "@/models/Protocol";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});

const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);
</script>

<style scoped></style>
