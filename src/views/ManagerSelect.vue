<template>
  <h1 style="text-align: center">Select a Protocol to Manage:</h1>
  <ProtocolSelector
    :showSearch="false"
    :showUserInfo="false"
    :manager="true"
    :autoSelect="true"
    @selection="selectProtocol"
  ></ProtocolSelector>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Protocol } from "@/models/Protocol";
import ProtocolSelector from "@/components/ProtocolSelector.vue";

export default defineComponent({
  name: "ManagerSelect",
  components: {
    ProtocolSelector,
  },
  data() {
    return {
      selectedProtocol: undefined as Protocol | undefined,
    };
  },
  watch: {},
  computed: {},
  methods: {
    selectProtocol(aProtocol: Protocol): void {
      this.selectedProtocol = aProtocol;
      this.$router.push(`/protocol/${aProtocol.id}`);
    },
  },
});
</script>

<style scoped></style>
