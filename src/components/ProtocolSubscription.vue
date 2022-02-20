<template>
  <div class="pt-2">
    <div class="row pb-1">
      <div class="flex sm6">
        <div class="row">
          <div class="flex sm12">
            Protocol Staking Level <strong>{{ stakingLevel }}</strong> with a
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
            <div class="flex sm12">
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
          :protocol="activeProtocol"
        ></ProtocolSubscriptionSummary>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Protocol } from "@/models/Protocol";
import { userModule } from "@/store/user";
import ProtocolSubscriptionSummary from "@/components/ProtocolSubscriptionSummary.vue";
import { computed, ref } from "vue";
import ContractInput from "./contractInput.vue";
import { Chain, ContractInfo } from "@/models/Contract";
import { StakingLevel } from "@/notifi_types";

// eslint-disable-next-line no-undef
const emit = defineEmits(["protocolUpdate"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  protocol: { type: Protocol, required: false },
});

const activeProtocol = ref(props.protocol || new Protocol());

const wallet = computed({
  get(): string {
    return activeProtocol.value.protocolStakingWallet;
  },
  set(newVal: string): void {
    activeProtocol.value.protocolStakingWallet = newVal;
    emit("protocolUpdate", activeProtocol.value);
  },
});

const walletChain = computed({
  get(): Chain {
    return activeProtocol.value.protocolStakingChain;
  },
  set(c: Chain): void {
    activeProtocol.value.protocolStakingChain = c;
  },
});

const stakingLevel = computed((): StakingLevel => {
  return activeProtocol.value.protocolStakingLevel;
});
const stakingBalance = computed((): number => {
  return activeProtocol.value.protocolStakingBalance;
});

const setStakingWallet = async (ci: ContractInfo): Promise<void> => {
  activeProtocol.value.protocolStakingWallet = ci.address;
  activeProtocol.value.protocolStakingChain = ci.chain;
  emit("protocolUpdate", activeProtocol.value);
  refresh();
};
const refresh = async (): Promise<void> => {
  userModule.fetchUserTokens();
};
</script>
