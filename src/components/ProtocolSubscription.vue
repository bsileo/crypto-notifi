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
            <div class="flex sm10">
              <ContractInput
                :chain="walletChain"
                :initialAddress="wallet"
                :showToken="false"
                :chainPrompt="true"
                @contractInfo="setStakingWallet"
                label="Protocol Staking Wallet"
              ></ContractInput>
            </div>
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
import { defineComponent, ref, watch } from "vue";
import ContractInput from "./contractInput.vue";
import { Chain, ContractInfo } from "@/models/Contract";

export default defineComponent({
  name: "ProtocolSubscription",
  components: { ProtocolSubscriptionSummary, ContractInput },
  emits: ["protocolUpdate"],
  props: {
    protocol: { type: Protocol, required: false },
  },
  setup(props) {
    const activeProtocol = ref(props.protocol || new Protocol());

    watch(
      () => props.protocol,
      (newProt, oldValue, onInvalidate) => {
        if (newProt) {
          activeProtocol.value = newProt;
        }
      },
      { deep: true }
    );

    return { activeProtocol };
  },
  data() {
    return {};
  },
  computed: {
    wallet: {
      get(): string {
        return this.activeProtocol.protocolStakingWallet;
      },
      set(newVal: string): void {
        this.activeProtocol.protocolStakingWallet = newVal;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    protocolChains(): Chain[] {
      return this.activeProtocol.chains;
    },
    stakingLevel(): StakingLevel {
      return this.activeProtocol.stakingLevel;
    },
    stakingBalance(): number {
      return this.activeProtocol.stakingBalance;
    },
  },
  methods: {
    async setStakingWallet(ci: ContractInfo): Promise<void> {
      this.activeProtocol.protocolStakingWallet = ci.address;
      this.activeProtocol.protocolStakingChain = ci.chain;
      this.$emit("protocolUpdate", this.protocol);
    },
    async refresh(): Promise<void> {
      userModule.fetchUserTokens();
    },
  },
});
</script>
