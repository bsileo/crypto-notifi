<template>
  <div>
    <div class="row pb-3"><h2>Information:</h2></div>
    <div class="row pb-1">
      <va-input
        class="flex sm12 md12 lg6 pb-1 pt-1"
        label="Description"
        type="textarea"
        autosize
        v-model="description"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12 md12 lg6"
        label="Website"
        v-model="website"
      ></va-input>
    </div>
    <div class="row pb-3"><h2>Staking Token:</h2></div>
    <div class="row pb-1">
      <div class="flex sm12 md12 lg8">
        <ContractInput
          :chain="stakingChain"
          :initialAddress="stakingAddress"
          :showToken="true"
          :chainPrompt="true"
          :protocol="protocol"
          @contractInfo="setContract"
        ></ContractInput>
      </div>
    </div>
    <div class="row pb-3"><h2>Staking Levels:</h2></div>
    <div class="row pb-1">
      <va-input class="flex sm2" label="Gold" v-model="goldLevel"></va-input>
      <va-input class="flex sm2" label="Basic" v-model="basicLevel"></va-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chain, ContractInfo } from "@/models/Contract";
import { Protocol } from "@/models/Protocol";
import { computed, ref } from "vue";
import ContractInput from "./contractInput.vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["protocolUpdate"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  protocol: { type: Protocol, required: false },
});
const activeProtocol = ref(props.protocol || new Protocol());

const description = computed({
  get(): string {
    if (!activeProtocol.value) return "";
    return activeProtocol.value.description;
  },
  set(desc: string): void {
    if (!activeProtocol.value) return;
    activeProtocol.value.description = desc;
    emit("protocolUpdate", activeProtocol.value);
  },
});

const setContract = (info: ContractInfo): void => {
  stakingAddress.value = info.address;
  stakingChain.value = info.chain;
  symbol.value = info.symbol;
};

const website = computed({
  get(): string {
    return activeProtocol.value.website;
  },
  set(newVal: string): void {
    activeProtocol.value.website = newVal;
    emit("protocolUpdate", activeProtocol.value);
  },
});

const symbol = computed({
  get(): string {
    return activeProtocol.value.symbol;
  },
  set(newVal: string): void {
    activeProtocol.value.symbol = newVal;
    emit("protocolUpdate", activeProtocol.value);
  },
});

const stakingAddress = computed({
  get(): string {
    return activeProtocol.value.userStakingAddress;
  },
  set(newVal: string): void {
    activeProtocol.value.userStakingAddress = newVal;
    emit("protocolUpdate", activeProtocol.value);
  },
});
const stakingChain = computed({
  get(): Chain {
    return activeProtocol.value.userStakingChain;
  },
  set(newVal: Chain): void {
    activeProtocol.value.userStakingChain = newVal;
    emit("protocolUpdate", activeProtocol.value);
  },
});
const goldLevel = computed({
  get(): string {
    return activeProtocol.value.goldQuantity.toString();
  },
  set(newVal: string): void {
    activeProtocol.value.goldQuantity = parseInt(newVal);
    emit("protocolUpdate", activeProtocol.value);
  },
});
const basicLevel = computed({
  get(): string {
    return activeProtocol.value.basicQuantity.toString();
  },
  set(newVal: string): void {
    if (!activeProtocol.value) return;
    activeProtocol.value.basicQuantity = parseInt(newVal);
    emit("protocolUpdate", activeProtocol.value);
  },
});
</script>
