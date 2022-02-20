<template>
  <ProtocolSubscription
    :protocol="selectedProtocol"
    @protocolUpdate="protocolUpdate"
  ></ProtocolSubscription>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Protocol } from "@/models/Protocol";
import { fetchProtocol, protocolUpdate } from "@/composables/getProtocolByID";
import ProtocolSubscription from "@/components/ProtocolSubscription.vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});
const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);
</script>

<style scoped></style>
