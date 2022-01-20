<template>
  <div>
    <div class="row pb-1">
      <va-input class="flex sm10" label="Name" v-model="name"></va-input>
      <va-button
        v-if="newRecord"
        icon="add"
        size="small"
        :disabled="!addAllowed"
        @click="add"
      ></va-button>
      <va-button
        v-if="!newRecord"
        icon="delete"
        size="small"
        @click="destroy"
      ></va-button>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="Description"
        textarea
        v-model="description"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="Topic"
        placeholder="Transfer(address, address, uint256)"
        v-model="topic"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="ABI"
        type="textarea"
        :min-rows="4"
        v-model="abi"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="Message Template"
        type="textarea"
        autosize
        v-model="template"
        placeholder="COMING SOON -- This is an alert for [[user]] triggered from [[contract]]"
      ></va-input>
    </div>
    <div class="row ml-1 pb-1">
      <va-chip
        v-for="(param, index) in dataParameters"
        :key="index"
        :color="param.source == 'system' ? 'warning' : 'success'"
        style="font-size: x-small"
        size="small"
        class="mr-1 mb-1"
        @click="parameterClick(param)"
      >
        {{ param.name }}
      </va-chip>
    </div>
  </div>
</template>

<script lang="ts">
import { ContractActivity } from "@/models/ContractActivity";
import { defineComponent, reactive } from "vue";
import { DataParameter } from "@/models/ContractActivity";

export default defineComponent({
  name: "EditContractActivity",
  components: {},
  emits: ["activityUpdate", "activityAdd", "activityDelete"],
  props: {
    contractActivity: { type: ContractActivity, required: false },
  },
  data() {
    return {
      activity: this.contractActivity || new ContractActivity(),
      intName: undefined as undefined | string,
    };
  },
  computed: {
    activeActivity(): ContractActivity {
      return this.activity;
    },
    newRecord(): boolean {
      return this.contractActivity == undefined;
    },
    name: {
      get(): string {
        return this.activity.name;
      },
      set(newVal: string): void {
        this.activity.name = newVal;
        this.$emit("activityUpdate", this.activity);
      },
    },
    description: {
      get(): string {
        return this.activity.description;
      },
      set(newDescription: string): void {
        this.activity.description = newDescription;
        this.$emit("activityUpdate", this.activity);
      },
    },
    topic: {
      get(): string {
        return this.activity.topic;
      },
      set(newTopic: string): void {
        this.activity.topic = newTopic;
        this.$emit("activityUpdate", this.activity);
      },
    },
    abi: {
      get(): string {
        return this.activity.ABI;
      },
      set(newABI: string): void {
        this.activity.ABI = newABI;
        this.$emit("activityUpdate", this.activity);
      },
    },
    template: {
      get(): string {
        return this.activity.template;
      },
      set(newVal: string): void {
        this.activity.template = newVal;
        this.$emit("activityUpdate", this.activeActivity);
      },
    },
    dataParameters(): DataParameter[] {
      return this.activeActivity.dataParameters;
    },
    addAllowed(): boolean {
      return (
        this.validName &&
        this.validDescription &&
        this.validTopic &&
        this.validABI &&
        this.validTemplate
      );
    },
    validName(): boolean {
      return (this.name || "").length > 3;
    },
    validTopic(): boolean {
      return (this.topic || "").length > 3;
    },
    validABI(): boolean {
      return true;
    },
    validDescription(): boolean {
      return true;
    },
    validTemplate(): boolean {
      return true;
    },
  },
  methods: {
    add(): void {
      this.$emit("activityAdd", this.activity);
      this.activity = reactive(new ContractActivity());
    },
    destroy(): void {
      this.activeActivity.destroy();
      this.$emit("activityDelete", this.activeActivity);
    },
    parameterClick(param: DataParameter): void {
      console.log(`Click on ${param.name}`);
      const cur = this.activeActivity.template || "";
      this.template = `${cur}{{${param.name}}}`;
    },
  },
});
</script>
