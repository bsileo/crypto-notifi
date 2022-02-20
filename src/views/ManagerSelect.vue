<template>
  <div>
    <h1 style="text-align: center">Select a Protocol to Manage:</h1>
    <ProtocolSelector
      :showSearch="false"
      :showUserInfo="false"
      :manager="true"
      :autoSelect="true"
      @selection="selectProtocol"
    ></ProtocolSelector>
  </div>
</template>

<script setup lang="ts">
import { Protocol } from "@/models/Protocol";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const selectedProtocol = ref<Protocol>();
const selectProtocol = (aProtocol: Protocol): void => {
  selectedProtocol.value = aProtocol;
  router.push(`/manager/${aProtocol.id}`);
};
const id = "select";
// eslint-disable-next-line no-undef
defineExpose({ id });
</script>

<style scoped></style>
