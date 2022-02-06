<template>
  <va-card
    class="flex xs12 sm4 lg3 xl2 mb-1"
    :class="{
      active: selected,
    }"
    :dark="selected"
    :stripe="selected"
    stripe-color="success"
    :href="allowSelectHref"
    @click.prevent="this.select(protocol)"
  >
    <va-card-title>
      <va-chip :href="protocol.website" shadow color="success" size="medium">{{
        protocol.name
      }}</va-chip>
    </va-card-title>
    <va-image style="height: 50px" contain :src="protocol.iconURL">
      <template #error> Image not found! :( </template>
      <template #loader>
        <va-progress-circle indeterminate />
      </template>
    </va-image>
    <div v-if="protocol.tokenData" class="pt-2">
      Token:
      <a :href="protocol.tokenContractURL()" target="_blank">
        {{ protocol.tokenData.symbol }}</a
      >
    </div>
    <div>
      <slot name="details" :protocol="protocol"></slot>
    </div>
    <div v-if="showVote">
      <div class="pt-2 row">
        <div class="flex xs4">Status:</div>
        <div v-if="protocol.protocolSiteStatus == 'Pending'" class="flex xs8">
          <va-badge
            visible-empty
            ref="badge"
            :text="protocol.protocolPendingVotes"
            class="mr-4"
          >
            {{ protocol.protocolSiteStatus }}
          </va-badge>
        </div>
        <div v-else class="flex xs8">
          {{ protocol.protocolSiteStatus }}
        </div>
      </div>
    </div>
    <div v-if="showUserInfo">Balance: {{ protocol.getWalletBalance() }}</div>
    <div v-if="showUserInfo">
      Level:<strong>{{ protocol.getUserLevel() }}</strong>
    </div>
    <va-card-actions>
      <va-button v-if="allowSelect" @click="this.select(protocol)"
        >Select</va-button
      >
      <va-popover
        color="primary"
        message="Request support for this Protocol on Notifi"
      >
        <va-button
          v-if="this.showVote && protocol.protocolSiteStatus == 'Pending'"
          size="small"
          @click="voteFor(protocol)"
          >Vote</va-button
        >
      </va-popover>
      <va-button
        v-if="this.showSubscribe && protocol.protocolSiteStatus == 'Active'"
        size="small"
        color="primary"
        @click="subscribe(protocol)"
        >Subscribe</va-button
      >
      <va-button
        v-if="this.showVote && protocol.protocolSiteStatus == 'Pending'"
        size="small"
        color="warning"
        @click="claim(protocol)"
        >Claim</va-button
      >
    </va-card-actions>
  </va-card>
  <va-modal v-model="showClaim" title="" hide-default-actions>
    <slot>
      <ProtocolClaim :protocol="protocol" @saved="claimSaved"></ProtocolClaim>
    </slot>
  </va-modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Moralis from "moralis";
import { Protocol } from "@/models/Protocol";
import ProtocolClaim from "./ProtocolClaim.vue";

export default defineComponent({
  name: "ProtocolInfo",
  components: { ProtocolClaim },
  emits: ["selected", "subscribe", "claimed"],
  props: {
    showVote: { type: Boolean, required: false, default: false },
    showSubscribe: { type: Boolean, required: false, default: false },
    showUserInfo: { type: Boolean, required: false, default: false },
    allowSelect: { type: Boolean, required: false, default: true },
    manager: { type: Boolean, required: false, default: false },
    protocol: { type: Protocol, required: true },
    selected: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      showClaim: false,
    };
  },
  computed: {
    allowSelectHref() {
      return this.allowSelect ? "#" : null;
    },
  },
  methods: {
    async voteFor(aProtocol: Protocol): Promise<void> {
      const newVotes = await aProtocol.siteVote();
      this.$forceUpdate();
    },
    claim(aProtocol: Protocol): void {
      this.showClaim = true;
    },
    claimSaved(aProtcolStatus: any): void {
      this.showClaim = false;
      this.$emit("claimed");
    },
    select(aProtocol: Protocol): void {
      if (this.allowSelect) {
        this.$emit("selected", this.protocol);
      }
    },
    subscribe(aProtocol: Protocol): void {
      this.$emit("subscribe", this.protocol);
    },
  },
});
</script>

<style scoped></style>
