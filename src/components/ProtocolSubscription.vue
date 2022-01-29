<template>
  <div class="pt-2">
    <div class="row pb-1">
      <div class="flex sm6">
        <div class="row">
          <div class="flex sm12">
            Current Staking Level <strong>{{ stakingLevel }}</strong> with a
            balance of <strong>{{ stakingBalance }} Notifi</strong>
            <span class="pl-4"
              ><va-button
                size="small"
                icon="refresh"
                color="secondary"
                @click="refresh"
              ></va-button>
            </span>
          </div>
          <div class="row pt-2">
            <va-select
              class="flex sm4"
              label="Chain"
              v-model="walletChain"
              :options="protocolChains"
              :rules="[this.walletChain != undefined || 'Select a chain']"
            />
            <div class="flex sm8">
              <ContractInput
                :chain="walletChain"
                :initialAddress="wallet"
                :showToken="false"
                @address="setWallet"
                label="Protocol Staking Wallet"
              ></ContractInput>
            </div>
          </div>
          <div class="row pt-2 ml-4">
            <va-button size="small" class="flex sm3" @click="setStakingWallet"
              >Set Wallet</va-button
            >
          </div>
        </div>
      </div>
      <div class="flex sm6">
        <ProtocolSubscriptionSummary
          :protocol="protocol"
        ></ProtocolSubscriptionSummary>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Protocol, StakingLevel } from "@/models/Protocol";
import { userModule } from "@/store/user";
import ProtocolSubscriptionSummary from "@/components/ProtocolSubscriptionSummary.vue";
import Moralis from "moralis";
import { defineComponent } from "vue";
import ContractInput from "./contractInput.vue";
import { Chain } from "@/models/Contract";

export default defineComponent({
  name: "ProtocolSubscription",
  components: { ProtocolSubscriptionSummary, ContractInput },
  emits: ["protocolUpdate"],
  props: {
    protocol: { type: Protocol, required: false },
  },
  data() {
    return {
      walletChain: "",
    };
  },
  computed: {
    wallet: {
      get(): string {
        return this.protocol?.stakingWallet || "";
      },
      set(newVal: string): void {
        if (this.protocol) {
          this.protocol.set("stakingWallet", newVal);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
    protocolChains(): Chain[] {
      if (this.protocol) {
        return this.protocol.chains;
      }
      return [];
    },
    stakingLevel(): StakingLevel {
      if (this.protocol) return this.protocol.stakingLevel;
      return StakingLevel.free;
    },
    stakingBalance(): number {
      if (this.protocol) return this.protocol.stakingBalance;
      return 0;
    },
  },
  methods: {
    async setStakingWallet(): Promise<void> {
      const u = Moralis.User.current();
      this.wallet = u?.get("accounts")[0];
    },
    async refresh(): Promise<void> {
      userModule.fetchUserTokens();
    },
  },
});
</script>
