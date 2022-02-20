<template>
  <protocol-alerts :protocol="selectedProtocol"> </protocol-alerts>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Protocol } from "@/models/Protocol";
import { fetchProtocol } from "@/composables/getProtocolByID";
import ProtocolAlerts from "@/components/ProtocolAlerts.vue"

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});

const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);
</script>

<style scoped></style>
