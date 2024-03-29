<template>
  <div>
    <div class="row pb-3 pt-3">
      <div class="flex lg9">
        <h3>Contract Details</h3>
      </div>
      <div class="flex lg3">
        <va-button size="medium" class="mr-4" icon="edit" @click="save"
          >Save</va-button
        >
        <va-button size="medium" icon="cancel" @click="cancel"
          >Cancel</va-button
        >
      </div>
    </div>
    <div class="container pl-3">
      <div class="row pb-1">
        <va-input
          class="flex sm4"
          label="Protocol"
          readonly
          v-model="protocolName"
        ></va-input>
        <va-input
          class="flex sm6"
          label="Contract name"
          v-model="contractName"
        ></va-input>
      </div>
      <div class="row pb-1">
        <va-select
          class="flex sm4"
          label="Chain"
          v-model="contractChain"
          :options="protocolChains"
          :rules="[contractChain != undefined || 'Select a chain']"
        />
        <div class="flex sm6">
          <ContractInput
            :initialAddress="contractAddress"
            :showToken="true"
            :chain="contractChain"
            @address="setContractAddress"
          ></ContractInput>
        </div>
      </div>
    </div>
    <va-divider></va-divider>
    <div class="row"><h3>Events</h3></div>
    <div class="layout pl-3">
      <div class="row ml-2">
        <va-card
          bordered
          class="flex sm12 md6 lg6 mb-2"
          v-bind:key="contractActivity.id"
          v-for="contractActivity in contractActivities"
        >
          <EditContractActivity
            :contractActivity="contractActivity"
            @activityDelete="contractActivityDeleted"
          >
          </EditContractActivity>
        </va-card>
        <va-card bordered class="flex sm12 md6 lg6">
          <va-card-title>Add an Activity</va-card-title>
          <EditContractActivity
            @activityAdd="addActivity"
          ></EditContractActivity>
        </va-card>
      </div>
    </div>
    <div class="pt-3 pb-3">
      <div class="row">
        <div class="flex lg9"></div>
        <div class="flex lg3">
          <va-button size="medium" class="mr-4" icon="edit" @click="save"
            >Save</va-button
          >
          <va-button size="medium" icon="cancel" @click="cancel"
            >Cancel</va-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { defineComponent } from "vue";
import { ContractActivity } from "@/models/ContractActivity";
import EditContractActivity from "./EditContractActivity.vue";
import { Chain, Contract } from "@/models/Contract";
import Moralis from "moralis";
import ContractInput from "./contractInput.vue";

export default defineComponent({
  name: "EditContract",
  components: { EditContractActivity, ContractInput },
  emits: ["contractUpdate", "contractSaved", "cancel", "updated"],
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
  updated() {
    this.$emit("updated");
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
    setContractAddress(address: string) {
      this.contractAddress = address;
    },
    async fetchContractActivities(): Promise<void> {
      const rel = this.activeContract.relation("ContractActivities");
      const q = rel.query();
      this.contractActivities = await q.find();
      //return this.contractActivities;
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
      var acl = new Moralis.ACL();
      acl.setReadAccess(Moralis.User.current().id, true);
      acl.setWriteAccess(Moralis.User.current().id, true);
      acl.setRoleReadAccess("admins", true);
      acl.setRoleWriteAccess("admins", true);
      acl.setRoleReadAccess(this.protocol.ACLName(), true);
      acl.setRoleWriteAccess(this.protocol.ACLName(), true);
      cont.setACL(acl);
      cont = await cont.save();
      if (cont) {
        let newActs: ContractActivity[] = [];
        const acts = this.contractActivities;
        for (let i = 0; i < acts.length; i++) {
          let ca = acts[i];
          ca.set("contract", cont);
          ca.setACL(acl);
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
