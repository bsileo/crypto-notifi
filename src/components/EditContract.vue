<template>
  <div>
    <va-form>
      <div class="row pb-1">
        <va-input
          class="flex sm12"
          label="Protocol"
          readonly
          v-model="protocolName"
        ></va-input>
      </div>
      <div class="row pb-1">
        <va-input
          class="flex sm12"
          label="Contract name"
          v-model="contractName"
        ></va-input>
      </div>
      <div class="row pb-1">
        <va-input
          class="flex sm12"
          label="Contract Address"
          v-model="contractAddress"
        ></va-input>
      </div>
      <div class="row pb-1">
        <va-select
          class="flex sm12"
          label="Chain"
          v-model="contractChain"
          :options="protocolChains"
          :disabled="protocolChains.length <= 1"
          :rules="[this.contractChain != undefined || 'Select a chain']"
        />
      </div>
      <va-divider></va-divider>
      <div class="row"><h3>Events</h3></div>
      <div class="row ml-3">
        <va-card
          bordered
          class="flex sm12 md6 lg4 pb-3"
          v-bind:key="contractActivity.id"
          v-for="contractActivity in contractActivities"
        >
          <EditContractActivity
            :contractActivity="contractActivity"
            @activityDelete="contractActivityDeleted"
          >
          </EditContractActivity>
        </va-card>
        <va-card bordered class="flex sm12 md6 lg4 pb-3">
          <EditContractActivity
            @activityAdd="addActivity"
          ></EditContractActivity>
        </va-card>
      </div>
      <div class="pt-3 pb-3">
        <va-button size="medium" class="mr-4" icon="edit" @click="save"
          >Save</va-button
        >
        <va-button size="medium" icon="cancel" @click="cancel"
          >Cancel</va-button
        >
      </div>
    </va-form>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { defineComponent } from "vue";
import { ContractActivity } from "@/models/ContractActivity";
import EditContractActivity from "./EditContractActivity.vue";
import { Chain, Contract } from "@/models/Contract";

export default defineComponent({
  name: "EditContract",
  components: { EditContractActivity },
  emits: ["contractUpdate", "contractSaved", "cancel"],
  props: {
    protocol: { type: Protocol, required: true },
    contract: { type: Contract, required: false },
  },
  data() {
    return {
      activeContract: this.contract || new Contract(),
      contractActivities: [] as ContractActivity[],
    };
  },
  mounted() {
    this.fetchContractActivities();
  },
  computed: {
    protocolName(): string {
      if (this.protocol) return this.protocol.name;
      return "";
    },
    protocolChains(): Chain[] {
      return this.protocol.chains;
    },
    contractName: {
      get(): string {
        return this.activeContract.name;
      },
      set(newName: string): void {
        this.activeContract.name = newName;
        this.$emit("contractUpdate", this.activeContract);
      },
    },
    contractAddress: {
      get(): string {
        return this.activeContract.address;
      },
      set(newAddress: string): void {
        this.activeContract.address = newAddress.toLowerCase();
        this.$emit("contractUpdate", this.activeContract);
      },
    },
    contractDescription: {
      get(): string {
        return this.activeContract.description;
      },
      set(newDesc: string): void {
        this.activeContract.description = newDesc;
        this.$emit("contractUpdate", this.activeContract);
      },
    },
    contractChain: {
      get(): Chain {
        if (this.activeContract.chain) {
          return this.activeContract.chain;
        } else {
          return this.protocolChains[0];
        }
      },
      set(newChain: Chain): void {
        this.activeContract.chain = newChain;
        this.$emit("contractUpdate", this.activeContract);
      },
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contractActivityDeleted(act: ContractActivity) {
      this.fetchContractActivities();
    },
    async fetchContractActivities(): Promise<ContractActivity[]> {
      const rel = this.activeContract.relation("ContractActivities");
      const q = rel.query();
      this.contractActivities = await q.find();
      return this.contractActivities;
    },
    async addActivity(aActivity: ContractActivity): Promise<void> {
      const rel = this.activeContract.relation("ContractActivities");
      aActivity.set("contract", this.activeContract);
      const act = await aActivity.save();
      rel.add(act);
      this.activeContract.save();
    },
    cancel(): void {
      this.$emit("cancel");
    },
    async save(): Promise<boolean> {
      let cont = this.activeContract;
      // Is it s new one?
      if (!cont.id) {
        cont.set("status", "Requested");
        cont.set("protocol", this.protocol);
        cont.set("chain", this.contractChain);
      }
      cont = await cont.save();
      if (cont) {
        let newActs: ContractActivity[] = [];
        const acts = this.contractActivities;
        for (let i = 0; i < acts.length; i++) {
          let ca = acts[i];
          ca.set("contract", cont);
          newActs.push(await ca.save());
        }
        const rel = cont.relation("ContractActivities");
        rel.add(newActs);
        await cont.save();
        this.$emit("contractSaved", cont);
      }
      return true;
    },
  },
});
</script>
