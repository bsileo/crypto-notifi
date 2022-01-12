<template>
  <div>
    <va-collapse
      v-model="showProtocolSelect"
      header="Select the Protcol to Manage"
      class="pb-3"
    >
      <div class="row pt-2 pb-2">
        <va-card
          class="flex sm6 md4 lg3 mr-2"
          :class="{
            active: this.selectedProtocol?.get('name') == protocol.name,
          }"
          :dark="this.selectedProtocol?.get('name') == protocol.name"
          :stripe="this.selectedProtocol?.get('name') == protocol.name"
          stripe-color="success"
          v-bind:key="protocol.id"
          v-for="protocol in protocols"
        >
          <va-card-title>{{ protocol.name }}</va-card-title>
          <va-image contain :src="protocol.iconURL">
            <template #error> Image not found! :( </template>
            <template #loader>
              <va-progress-circle indeterminate />
            </template>
          </va-image>
          <div>
            Token:
            <a :href="protocol.tokenContractURL()" target="_frame">
              {{ protocol.tokenData.symbol }}</a
            >
          </div>
          <va-card-actions align="between">
            <va-button @click="selectedProtocol = protocol">Select</va-button>
          </va-card-actions>
        </va-card>
      </div>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showAlert"
      header="Send an Alert"
      :disabled="!this.selectedProtocol"
    >
      <div class="flex sm12 mb-3">
        <div class="row pt-2">
          <va-select
            class="flex sm12"
            label="Type of Alert"
            v-model="alertCategory"
            :options="subCategories"
            text-by="name"
            :rules="[
              (alertCategory) => alertCategory != null || 'Select a type',
            ]"
          />
        </div>
        <div class="row pt-2">
          <va-input
            class="mb-1"
            v-model="newContent"
            type="textarea"
            label="Enter Alert Content"
          />
        </div>
        <div class="row mb-2">
          <va-button
            style="margin-left: 20px"
            class="flex sm4"
            :disabled="!validSubmit"
            @click.prevent="add"
            color="danger"
            icon-right="create"
            size="medium"
            >Send Alert</va-button
          >
          <va-alert
            color="success"
            closeable
            class="flex sm9"
            v-model="showSuccess"
          >
            Alert sent
          </va-alert>
        </div>
      </div>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showProtocol"
      header="Configure General Alerts"
      :disabled="!this.selectedProtocol"
    >
      <div class="row ml-4">
        <div v-if="!this.selectedProtocol">
          <h3>Select a Protocol first</h3>
        </div>
        <div
          class="flex sm12 md6 lg4 mr-2 pb-3"
          v-bind:key="category.id"
          v-for="category in subCategories"
        >
          <EditCategory
            :category="category"
            @update:name="updateCategoryName"
            @update:description="updateCategoryDescription"
            @deactivated="deactivateCategory"
          ></EditCategory>
        </div>
        <div v-if="this.selectedProtocol" class="flex sm12 md6 lg4 mr-2 pb-3">
          <va-card class="flex">
            <va-card-title>Add a Category</va-card-title>
            <div>
              <va-form>
                <va-input
                  class="pb-1"
                  placeholder="Category Name"
                  v-model="newCategory.name"
                  label="Name"
                >
                </va-input>
                <va-input
                  class="pb-1"
                  placeholder="Type identifier"
                  v-model="newCategory.type"
                  label="Identifier"
                >
                </va-input>
                <va-input
                  type="textarea"
                  :min-rows="3"
                  :max-rows="5"
                  v-model="newCategory.description"
                  label="Description"
                >
                </va-input>
              </va-form>
            </div>
            <va-card-actions align="between">
              <va-button
                size="medium"
                :disabled="!allowAddCategory"
                @click="addNewCategory"
                >Add</va-button
              >
            </va-card-actions>
          </va-card>
        </div>
      </div>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showHistory"
      header="General Alert History"
      :disabled="!this.selectedProtocol"
    >
      <div>
        <va-data-table
          :items="alerts"
          v-model:sort-by="sortBy"
          v-model:sorting-order="sortingOrder"
          :columns="columns"
        >
          <template #header(date)>Date</template>
          <template #header(content)>Content</template>
          <template #cell(type)="{ source: type }">
            {{ getCategoryName(type) }}
          </template>
        </va-data-table>
      </div>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showTransactional"
      header="Configure Transactional Alerts"
      :disabled="!this.selectedProtocol"
    >
      <h1>Coming Soon</h1>
    </va-collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Alert, AlertTypes } from "@/models/Alert";
import { alertsModule } from "@/store/alerts";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import Moralis from "moralis";
import EditCategory from "./EditCategory.vue";

export default defineComponent({
  name: "Alerter",
  components: { EditCategory },
  data() {
    const columns = [
      { key: "shortDateTime", label: "Date", sortable: true },
      { key: "type", label: "Alert Type", sortable: true },
      { key: "content", label: "Content", sortable: true },
    ];
    return {
      alertCategory: undefined as SubscriptionType | undefined,
      newContent: "",
      columns: columns,
      showProtocolSelect: true,
      showAlert: false,
      showProtocol: false,
      showHistory: false,
      showTransactional: false,
      showSuccess: false,
      sortBy: "date",
      sortingOrder: "desc",
      selectedProtocol: undefined as Protocol | undefined,
      subCategories: [] as SubscriptionType[],
      newCategory: { name: "", type: "", description: "" },
    };
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.alertCategory = undefined;
      this.showProtocolSelect = false;
      this.showAlert = true;
      await this.fetchsubCategories();
      alertsModule.SET_PROTOCOL(this.selectedProtocol);
    },
  },
  computed: {
    validSubmit(): boolean {
      return this.alertCategory != undefined && this.newContent != "";
    },
    protocols(): Protocol[] {
      return protocolsModule.myAdminProtocols;
    },
    alerts(): Alert[] {
      return alertsModule.sentAlerts;
    },
    allowAddCategory(): boolean {
      return (
        this.newCategory.name.length > 3 && this.newCategory.type.length > 3
      );
    },
  },
  methods: {
    getCategoryName(type: string): string {
      const cat = this.subCategories.find((sg) => sg.type == type);
      console.log(`GetCategoryName: ${type}`);
      return cat?.name || "";
    },
    async addNewCategory(): Promise<void> {
      if (this.selectedProtocol) {
        let st = await SubscriptionType.spawn(
          this.selectedProtocol,
          this.newCategory.name,
          this.newCategory.type,
          this.newCategory.description
        );
        st.save();
        this.newCategory = { name: "", type: "", description: "" };
        this.fetchsubCategories();
      }
    },
    async fetchsubCategories(): Promise<void> {
      const q = new Moralis.Query(SubscriptionType);
      if (this.selectedProtocol) {
        q.equalTo("protocol", this.selectedProtocol);
        q.equalTo("status", SubscriptionTypeStatus.active);
        const res = await q.find();
        this.subCategories = res;
        if (this.subCategories.length == 1) {
          this.alertCategory = this.subCategories[0];
        }
      }
    },
    async add(): Promise<void> {
      console.log(`Add Alert`);
      if (this.alertCategory == undefined) {
        alert("Select a category");
        return;
      }
      const c = Alert.spawn(
        this.alertCategory?.name,
        this.newContent,
        this.selectedProtocol
      );
      c.save().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: Alert) => {
          // Execute any logic that should take place after the object is saved.
          this.newContent = "";
          this.showSuccess = true;
        },
        (error: { message: string }) => {
          // Execute any logic that should take place if the save fails.
          // error is a Moralis.Error with an error code and message.
          alert(
            "Failed to create new object, with error code: " + error.message
          );
        }
      );
    },
    async updateCategoryName(
      cat: SubscriptionType,
      newName: string
    ): Promise<void> {
      cat.set("name", newName);
      //cat.set("description", cat.description);
      cat = await cat.save();
      await this.fetchsubCategories();
    },
    async updateCategoryDescription(
      cat: SubscriptionType,
      newDesc: string
    ): Promise<void> {
      cat.set("description", newDesc);
      cat = await cat.save();
      await this.fetchsubCategories();
    },
    async deactivateCategory(cat: SubscriptionType): Promise<void> {
      cat.set("status", SubscriptionTypeStatus.inactive);
      await cat.save();
      this.fetchsubCategories();
    },
  },
});
</script>

<style scoped></style>
