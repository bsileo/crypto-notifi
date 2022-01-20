<template>
  <div>
    <va-collapse v-model="showProtocolSelect" class="pb-3" icon="info">
      <template #header>
        <div class="va-collapse__header">
          <div
            v-if="this.selectedProtocol"
            class="row va-collapse__header__content"
          >
            <va-icon class="flex sm1 pr-3" name="info"></va-icon>
            <div class="flex sm10">
              Manage <strong>{{ this.selectedProtocol.name }}</strong>
            </div>
            <va-icon
              v-if="showProtocolSelect"
              class="flex sm1"
              name="expand_less"
            ></va-icon>
            <va-icon v-else class="flex sm1" name="expand_more"></va-icon>
          </div>
          <div
            v-if="!this.selectedProtocol"
            class="row va-collapse__header__content"
          >
            <va-icon class="flex sm1 pr-3" name="info"></va-icon>
            <span class="flex sm10">Select the Protcol to Manage</span>
            <va-icon
              v-if="showProtocolSelect"
              class="flex sm1"
              name="expand_less"
            ></va-icon>
            <va-icon v-else class="flex sm1" name="expand_more"></va-icon>
          </div>
        </div>
      </template>
      <ProtocolSelector
        :showSearch="false"
        :showUserInfo="false"
        @selection="selectProtocol"
      ></ProtocolSelector>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showAlert"
      header="Send an Alert"
      :disabled="!this.selectedProtocol"
      icon="notifications"
    >
      <SendAlert @alert:sent="alertSent" :protocol="selectedProtocol">
      </SendAlert>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showProtocolSetup"
      header="ProtocolSettings"
      :disabled="!this.selectedProtocol"
      icon="settings"
    >
      <ProtocolSettings
        :protocol="selectedProtocol"
        @protocolUpdate="protocolUpdate"
      ></ProtocolSettings>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showProtocol"
      header="Configure Alert Categories"
      icon="tune"
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
      icon="view_list"
      :disabled="!this.selectedProtocol"
    >
      <div>
        <va-data-table
          :items="alerts"
          v-model:sort-by="sortBy"
          v-model:sorting-order="sortingOrder"
          :columns="columns"
        >
          <template #header(shortDateTime)>Date</template>
          <template #header(content)>Content</template>
          <template #cell(shortDateTime)="{ source: shortDateTime }">
            <col class="dateCol" />
            {{ shortDateTime }}
          </template>
          <template #cell(type)="{ source: type }">
            {{ getCategoryName(type) }}
          </template>
          <template #cell(content)="{ source: content }">
            <div style="width: 50%">{{ content }}</div>
          </template>
        </va-data-table>
      </div>
    </va-collapse>
    <va-collapse
      class="pb-3"
      v-model="showTransactional"
      header="Configure Transactional Alerts"
      icon="alt_route"
      :disabled="!this.selectedProtocol"
    >
      <div class="row ml-2">
        <va-card
          square
          outlined
          class="flex sm12 md4 lg3 mr-1"
          v-bind:key="contract.id"
          v-for="contract in contracts"
        >
          <va-card-title>{{ contract.name }}</va-card-title>
          <div>
            <va-chip outline>{{ contract.chain }}</va-chip>
            {{ contract.short_address }}
          </div>
          <va-card-actions align="stretch">
            <va-button
              @click="
                this.selectedContract = contract;
                showAddContract = true;
              "
              icon="edit"
            ></va-button>
          </va-card-actions>
        </va-card>
      </div>
      <div class="ml-2 mt-2">
        <va-button @click="startAddContract" icon="add">Add Contract</va-button>
      </div>
    </va-collapse>
    <va-modal fullscreen hide-default-actions v-model="showAddContract">
      <EditContract
        @contractSaved="contractSaved"
        @cancel="showAddContract = false"
        :contract="this.selectedContract"
        :protocol="this.selectedProtocol"
      ></EditContract>
    </va-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Alert } from "@/models/Alert";
import { alertsModule } from "@/store/alerts";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import Moralis from "moralis";
import EditCategory from "./EditCategory.vue";
import SendAlert from "./SendAlert.vue";
import EditContract from "./EditContract.vue";
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolSettings from "./ProtocolSettings.vue";
import { Contract } from "@/models/Contract";

export default defineComponent({
  name: "ProtocolManager",
  components: {
    EditCategory,
    SendAlert,
    EditContract,
    ProtocolSelector,
    ProtocolSettings,
  },
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
      showProtocolSetup: false,
      showHistory: false,
      showTransactional: false,
      showSuccess: false,
      showAddContract: false,
      sortBy: "shortDateTime",
      sortingOrder: "desc",
      selectedProtocol: undefined as Protocol | undefined,
      subCategories: [] as SubscriptionType[],
      newCategory: { name: "", type: "", description: "" },
      contracts: [] as Contract[],
      selectedContract: undefined as Contract | undefined,
    };
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.alertCategory = undefined;
      this.showProtocolSelect = false;
      this.showAlert = true;
      alertsModule.SET_PROTOCOL(this.selectedProtocol);
      await this.fetchsubCategories();
      await this.fetchContracts();
    },
  },
  computed: {
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
    selectProtocol(aProtocol: Protocol): void {
      this.selectedProtocol = aProtocol;
    },
    async protocolUpdate(aProtocol: Protocol): Promise<void> {
      aProtocol.save();
    },
    getCategoryName(type: string): string {
      const cat = this.subCategories.find((sg) => sg.type == type);
      console.log(`GetCategoryName: ${type}=${cat}`);
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
    startAddContract() {
      this.selectedContract = new Contract();
      this.showAddContract = true;
    },
    contractSaved() {
      this.showAddContract = false;
      this.fetchContracts();
    },
    async fetchContracts(): Promise<Contract[]> {
      if (this.selectedProtocol) {
        const cons = await this.selectedProtocol.contracts();
        this.contracts = cons;
      } else {
        this.contracts = [];
      }
      return this.contracts;
    },
    alertSent() {
      console.log("Alert Sent!");
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
