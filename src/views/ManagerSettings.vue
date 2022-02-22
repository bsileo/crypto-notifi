<template>
  <ProtocolSettings
    :protocol="selectedProtocol"
    @protocolUpdate="protocolUpdate"
  ></ProtocolSettings>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Protocol } from "@/models/Protocol";
import { fetchProtocol, protocolUpdate } from "@/composables/getProtocolByID";
import ProtocolSettings from "@/components/ProtocolSettings.vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});
const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);
</script>

<style scoped></style>
