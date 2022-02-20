<template>
  <SendAlert @alert:sent="alertSent" :protocol="selectedProtocol"> </SendAlert>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Protocol } from "@/models/Protocol";
import SendAlert from "@/components/SendAlert.vue";
import { fetchProtocol } from "@/composables/getProtocolByID";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});

const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);

const alertSent = () => {
  console.log("Alert Sent!");
};

const id = "send-" + props.protocolID;
// eslint-disable-next-line no-undef
defineExpose({ id });
</script>

<style scoped></style>
