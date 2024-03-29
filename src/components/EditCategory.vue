<template>
  <va-card class="flex">
    <va-card-title>{{ cardTitle }}</va-card-title>
    <div>
      <va-form>
        <va-input
          class="pb-1"
          placeholder="Category Name"
          v-model="name"
          label="Name"
        >
        </va-input>
        <va-popover message="Coming Soon">
          <div class="pl-2">
            <va-radio
              v-for="option in listModeOptions"
              disabled
              :key="option"
              :option="option"
              v-model="listMode"
            />
          </div>
        </va-popover>
        <va-input
          class="pt-2"
          type="textarea"
          :min-rows="3"
          :max-rows="5"
          v-model="description"
          label="Description"
        >
        </va-input>
        <LevelSelector @changed="setLevel"></LevelSelector>
      </va-form>
    </div>
    <va-card-actions align="between">
      <va-button size="medium" @click="deactivateCategory()" v-if="!newRecord"
        >Deactivate</va-button
      >
      <va-button
        size="medium"
        :disabled="!allowAddCategory"
        @click="addNew"
        v-if="newRecord"
        >Add</va-button
      >
    </va-card-actions>
  </va-card>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import Moralis from "moralis";
import { defineComponent } from "vue";
import LevelSelector from "./LevelSelector.vue";

export default defineComponent({
  name: "EditCategory",
  components: { LevelSelector },
  props: {
    category: {
      type: SubscriptionType,
      required: false,
    },
    protocol: {
      type: Protocol,
      required: true,
    },
  },
  emits: ["update:name", "update:description", "deactivated", "added"],
  data() {
    return {
      activeCategory: this.category || new SubscriptionType(),
      listMode: "Public",
      listModeOptions: ["Public", "Moderated", "Private"],
    };
  },
  computed: {
    levelOptions(): string[] {
      return ["Free", "Basic", "Gold"];
    },
    cardTitle(): string {
      if (this.newRecord) {
        return "Add a Category";
      } else {
        return this.activeCategory.name;
      }
    },
    newRecord(): boolean {
      return this.activeCategory.id == undefined;
    },
    name: {
      get(): string {
        return this.activeCategory.name;
      },
      set(newVal: string): void {
        this.activeCategory.name = newVal;
        if (!this.newRecord) {
          this.activeCategory.save();
        }
        this.$emit("update:name", this.activeCategory, newVal);
      },
    },
    description: {
      get(): string {
        return this.activeCategory.description;
      },
      set(newVal: string): void {
        this.activeCategory.description = newVal;
        if (!this.newRecord) {
          this.activeCategory.save();
        }
        this.$emit("update:description", this.activeCategory, newVal);
      },
    },
    level: {
      get(): string {
        return this.activeCategory.level;
      },
      set(newVal: string): void {
        this.activeCategory.level = newVal;
        if (!this.newRecord) {
          this.activeCategory.save();
        }
      },
    },
    allowAddCategory(): boolean {
      return this.activeCategory.name?.length > 3 && this.level != "";
    },
  },
  methods: {
    async addNew(): Promise<void> {
      this.activeCategory.set("protocol", this.protocol);
      this.activeCategory.set("status", SubscriptionTypeStatus.active);
      var acl = new Moralis.ACL();
      acl.setReadAccess(Moralis.User.current().id, true);
      acl.setWriteAccess(Moralis.User.current().id, true);
      acl.setRoleReadAccess("admins", true);
      acl.setRoleWriteAccess("admins", true);
      acl.setRoleReadAccess(this.protocol.ACLName(), true);
      acl.setRoleWriteAccess(this.protocol.ACLName(), true);
      this.activeCategory.setACL(acl);
      await this.activeCategory.save();
      this.$emit("added", this.activeCategory);
      this.activeCategory = new SubscriptionType();
    },
    async deactivateCategory(): Promise<void> {
      if (this.activeCategory) {
        this.activeCategory.set("status", SubscriptionTypeStatus.inactive);
        await this.activeCategory.save();
        this.$emit("deactivated", this.activeCategory);
      }
    },
    setLevel(aLevel: string): void {
      console.log(aLevel);
      this.level = aLevel;
    },
  },
});
</script>
