<template>
  <div class="container p-3 gutter--md">
    <ProtocolSelector
      :showSearch="true"
      :showVote="true"
      :showSubscribe="true"
      :showUserInfo="false"
      :allowSelect="false"
      :showStatus="true"
      @subscribe="protocolSubscribe"
    >
    </ProtocolSelector>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import { Protocol } from "@/models/Protocol";

export default defineComponent({
  name: "Protocols",
  components: { ProtocolSelector },
  methods: {
    protocolSubscribe(aProtocol: Protocol) {
      this.$router.push(`/protocol/${aProtocol.id}/subscribe`)
    },
  },
});
</script>

<style scoped>
</style>
