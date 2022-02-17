<template>
  <div>
    <div class="row pb-1">
      <va-input
        class="flex sm12 pb-1 pt-1"
        label="Description"
        type="textarea"
        autosize
        v-model="description"
      ></va-input>
      <va-input class="flex sm12" label="Website" v-model="website"></va-input>
    </div>
    <div class="row pb-1"><h2>Staking Token</h2></div>
    <div class="row pb-1">
      <div class="flex sm12">
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
    <div class="row pb-1"><h2>Staking Levels</h2></div>
    <div class="row pb-1">
      <va-input class="flex sm2" label="Gold" v-model="goldLevel"></va-input>
      <va-input class="flex sm2" label="Basic" v-model="basicLevel"></va-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Chain, ContractInfo } from "@/models/Contract";
import { Protocol } from "@/models/Protocol";
import { defineComponent, reactive, ref, watch, watchEffect } from "vue";
import ContractInput from "./contractInput.vue";

export default defineComponent({
  name: "ProtocolSettings",
  components: { ContractInput },
  emits: ["protocolUpdate"],
  props: {
    protocol: { type: Protocol, required: false },
  },
  setup(props) {
    const activeProtocol = ref(new Protocol());

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
    description: {
      get(): string {
        return this.activeProtocol.description;
      },
      set(desc: string): void {
        this.activeProtocol.description = desc;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    protocolChains(): Chain[] {
      return this.activeProtocol.chains;
    },
    website: {
      get(): string {
        return this.protocol?.website || "";
      },
      set(newVal: string): void {
        this.activeProtocol.website = newVal;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    symbol: {
      get(): string | number {
        return this.activeProtocol.symbol;
      },
      set(newVal: string): void {
        this.activeProtocol.symbol = newVal;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    stakingAddress: {
      get(): string | number {
        return this.activeProtocol.userStakingAddress;
      },
      set(newVal: string): void {
        this.activeProtocol.userStakingAddress = newVal;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    stakingChain: {
      get(): string | number {
        return this.activeProtocol.userStakingChain;
      },
      set(newVal: Chain): void {
        this.activeProtocol.userStakingChain = newVal;
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    goldLevel: {
      get(): string | number {
        return this.activeProtocol.goldQuantity;
      },
      set(newVal: string): void {
        this.activeProtocol.goldQuantity = parseInt(newVal);
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    basicLevel: {
      get(): string | number {
        return this.activeProtocol.basicQuantity;
      },
      set(newVal: string): void {
        this.activeProtocol.basicQuantity = parseInt(newVal);
        this.$emit("protocolUpdate", this.protocol);
      },
    },
  },
  methods: {
    setContract(info: ContractInfo) {
      this.stakingAddress = info.address;
      this.stakingChain = info.chain;
      this.symbol = info.symbol;
    },
  },
});
</script>
