<template>
  <va-card class="flex">
    <va-card-title>{{ name }}</va-card-title>
    <div>
      <va-form>
        <va-input
          class="pb-1"
          placeholder="Category Name"
          v-model="name"
          label="Name"
        >
        </va-input>
        <va-input
          class="pb-1"
          v-model="type"
          disabled
          label="Identifier"
        ></va-input>
        <va-input
          placeholder="Category Name"
          type="textarea"
          :min-rows="3"
          :max-rows="5"
          v-model="description"
          label="Description"
        >
        </va-input>
      </va-form>
    </div>
    <va-card-actions align="between">
      <va-button size="medium" @click="deactivateCategory()"
        >Deactivate</va-button
      >
    </va-card-actions>
  </va-card>
</template>

<script lang="ts">
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EditCategory",
  components: {},
  props: {
    category: {
      type: SubscriptionType,
      required: true,
    },
  },
  emits: ["update:name", "update:type", "update:description", "deactivated"],
  data() {
    return {};
  },
  computed: {
    name: {
      get(): string {
        return this.category.name;
      },
      set(newVal: string): void {
        this.$emit("update:name", this.category, newVal);
      },
    },
    type: {
      get(): string {
        return this.category.type;
      },
      set(newVal: string): void {
        this.$emit("update:type", this.category, newVal);
      },
    },
    description: {
      get(): string {
        return this.category.description;
      },
      set(newVal: string): void {
        this.$emit("update:description", this.category, newVal);
      },
    },
  },
  methods: {
    async deactivateCategory(): Promise<void> {
      if (this.category) {
        this.category.set("status", SubscriptionTypeStatus.inactive);
        this.category.save();
        this.$emit("deactivated", this.category);
      }
    },
  },
});
</script>
