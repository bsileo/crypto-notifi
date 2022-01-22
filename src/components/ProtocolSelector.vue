<template>
  <div>
    <div class="row pb-1">
      <va-input
        v-if="showSearch"
        class="flex sm12"
        label="Search Protocols"
        v-model="search"
      ></va-input>
    </div>
    <div class="row pt-2 pb-4">
      <va-card
        class="flex sm6 md4 lg3 mr-2"
        :class="{
          active: this.selectedProtocol?.get('name') == protocol.name,
        }"
        :dark="this.selectedProtocol?.get('name') == protocol.name"
        :stripe="this.selectedProtocol?.get('name') == protocol.name"
        stripe-color="success"
        v-bind:key="protocol.id"
        v-for="protocol in protocols"
      >
        <va-card-title>
          <va-chip
            :href="protocol.website"
            shadow
            color="success"
            size="medium"
            >{{ protocol.name }}</va-chip
          >
        </va-card-title>
        <va-image style="height: 50px" contain :src="protocol.iconURL">
          <template #error> Image not found! :( </template>
          <template #loader>
            <va-progress-circle indeterminate />
          </template>
        </va-image>
        <div>
          <slot name="protocol"></slot>
        </div>
        <div>
          Token:
          <a :href="protocol.tokenContractURL()" target="_frame">
            {{ protocol.tokenData.symbol }}</a
          >
        </div>
        <div v-if="showUserInfo">
          Balance: {{ protocol.getWalletBalance() }}
        </div>
        <div v-if="showUserInfo">Level: {{ protocol.getUserLevel() }}</div>
        <va-card-actions align="between">
          <va-button @click="this.select(protocol)">Select</va-button>
        </va-card-actions>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import { userModule } from "@/store/user";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProtocolSelector",
  components: {},
  emits: ["selection"],
  props: {
    showSearch: { type: Boolean, required: false, default: true },
    showUserInfo: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      search: "",
      selectedProtocol: undefined as Protocol | undefined,
    };
  },
  mounted() {
    userModule.fetchUserTokens();
  },
  computed: {
    protocols(): Protocol[] {
      const prots = protocolsModule.allProtocols;
      if (this.search) {
        const result = prots.filter((e: Protocol) => {
          const idx = e.name.toLowerCase().indexOf(this.search.toLowerCase());
          return idx != -1;
        });
        return result;
      } else {
        return prots;
      }
    },
  },
  methods: {
    select(aProtocol: Protocol): void {
      console.log(`selected ${aProtocol}`);
      this.selectedProtocol = aProtocol;
      this.$emit("selection", this.selectedProtocol);
    },
  },
});
</script>