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
      <va-input
        class="flex sm3 pb-1"
        label="Symbol"
        v-model="symbol"
      ></va-input>
      <ContractInput
        :chain="stakingChain"
        :initialAddress="contractAddress"
        :showToken="true"
        @address="setAddress"
      ></ContractInput>
    </div>
    <div class="row pb-1"><h2>Staking Levels</h2></div>
    <div class="row pb-1">
      <va-input class="flex sm2" label="Gold" v-model="goldLevel"></va-input>
      <va-input class="flex sm2" label="Basic" v-model="basicLevel"></va-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { defineComponent } from "vue";
import ContractInput from "./contractInput.vue";

export default defineComponent({
  name: "ProtocolSettings",
  components: { ContractInput },
  emits: ["protocolUpdate"],
  props: {
    protocol: { type: Protocol, required: false },
  },
  data() {
    return {};
  },
  computed: {
    description: {
      get(): string {
        return this.protocol?.description || "";
      },
      set(desc: string): void {
        this.protocol?.set("description", desc);
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    website: {
      get(): string {
        return this.protocol?.website || "";
      },
      set(newVal: string): void {
        this.protocol?.set("website", newVal);
        this.$emit("protocolUpdate", this.protocol);
      },
    },
    symbol: {
      get(): string | number {
        return this.protocol?.tokenData.symbol || 0;
      },
      set(newVal: string): void {
        if (this.protocol) {
          const tData = this.protocol.tokenData;
          tData.symbol = newVal;
          this.protocol.set("tokenData", tData);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
    contractAddress: {
      get(): string | number {
        return this.protocol?.tokenData.contractAddress || 0;
      },
      set(newVal: string): void {
        if (this.protocol) {
          const tData = this.protocol.tokenData;
          tData.contractAddress = newVal;
          this.protocol.set("tokenData", tData);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
    stakingChain: {
      get(): string | number {
        return this.protocol?.tokenData.chain || 0;
      },
      set(newVal: string): void {
        if (this.protocol) {
          const tData = this.protocol.tokenData;
          tData.chain = newVal;
          this.protocol.set("tokenData", tData);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
    goldLevel: {
      get(): string | number {
        return this.protocol?.tokenData.goldQuantity || 0;
      },
      set(newVal: string): void {
        if (this.protocol) {
          const tData = this.protocol.tokenData;
          tData.goldQuantity = parseInt(newVal);
          this.protocol.set("tokenData", tData);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
    basicLevel: {
      get(): string | number {
        return this.protocol?.tokenData.basicQuantity || 0;
      },
      set(newVal: string): void {
        if (this.protocol) {
          const tData = this.protocol.tokenData;
          tData.basicQuantity = parseInt(newVal);
          this.protocol.set("tokenData", tData);
          this.$emit("protocolUpdate", this.protocol);
        }
      },
    },
  },
  methods: {
    setAddress(address: string) {
      this.contractAddress = address;
    },
  },
});
</script>
