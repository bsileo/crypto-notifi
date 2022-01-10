<template>
  <div>
    <va-collapse v-model="showAlert" header="Send an Alert">
      <div class="flex sm12">
        <div class="row pt-2 pb-4">
          <va-card
            class="flex sm6 md4 lg3 mr-2"
            :class="{
              active: this.selectedProtocol?.get('name') == protocolInfo.name,
            }"
            :dark="this.selectedProtocol?.get('name') == protocolInfo.name"
            :stripe="this.selectedProtocol?.get('name') == protocolInfo.name"
            stripe-color="success"
            v-bind:key="protocolInfo.id"
            v-for="protocolInfo in protocols"
          >
            <va-card-title>{{ protocolInfo.name }}</va-card-title>
            <va-image contain :src="protocolInfo.iconURL">
              <template #error> Image not found! :( </template>
              <template #loader>
                <va-progress-circle indeterminate />
              </template>
            </va-image>
            <div>
              Token:
              <a :href="protocolInfo.protocol.tokenContractURL()" target="_frame">
                {{ protocolInfo.protocol.get("tokenData").symbol }}</a
              >
            </div>
            <va-card-actions align="between">
              <va-button @click="selectedProtocol = protocolInfo.protocol"
                >Select</va-button
              >
            </va-card-actions>
          </va-card>
        </div>
        <div class="row pt-2">
          <va-select
            class="flex sm12"
            label="Type of Alert"
            v-model="newType"
            :options="subGeneralTypes"
            value-by="type"
            text-by="name"
            :rules="[
              (subGeneralType) => subGeneralType != null || 'Select a type',
            ]"
          />
        </div>
        <div class="row pt-2">
          <va-input
            class="mb-4"
            v-model="newContent"
            type="textarea"
            label="Enter Alert Content"
          />
        </div>
        <div class="row">
          <va-button
            class="flex sm2"
            center
            :disabled="!validSubmit"
            @click.prevent="add"
            color="danger"
            icon-right="create"
            size="large"
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
    <div class="pt-4">
      <va-collapse v-model="showProtocol" header="Manage Protocol Alerts">
        <div>
          <h3>Coming Soon</h3>
        </div>
      </va-collapse>
    </div>
    <div class="pt-4">
      <va-collapse v-model="showHistory" header="Alert History">
        <div>
          <va-data-table
            :items="sentAlerts"
            v-model:sort-by="sortBy"
            v-model:sorting-order="sortingOrder"
            :columns="columns"
          >
            <template #header(date)>Date</template>
            <template #header(content)>Content</template>
          </va-data-table>
        </div>
      </va-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Alert } from "@/models/Alert";
import { alertsModule } from "@/store/alerts";
import { SubscriptionType } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import Moralis from "moralis";

interface protocolInfo {
  name: string;
  iconURL: string;
  protocol: Protocol;
}

interface subGeneralTypeInfo {
  type: string;
  name: string;
}
let sgti: subGeneralTypeInfo[] = [];

let prot: Protocol | undefined = undefined;

export default defineComponent({
  name: "Alerter",
  components: {},
  data() {
    const columns = [
      { key: "date", label: "Date", sortable: true },
      { key: "type", label: "Alert Type", sortable: true },
      { key: "content", label: "Content", sortable: true },
    ];
    return {
      newType: "",
      newContent: "",
      columns: columns,
      showAlert: true,
      showProtocol: false,
      showHistory: false,
      showSuccess: false,
      sortBy: "date",
      sortingOrder: "desc",
      selectedProtocol: prot,
      subGeneralTypes: sgti,
    };
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.newType = "";
      this.fetchSubGeneralTypes();
    },
  },
  computed: {
    validSubmit(): boolean {
      return this.newType != "" && this.newContent != "";
    },
    protocols(): protocolInfo[] {
      return protocolsModule.myAdminProtocols.map((e: Protocol) => {
        return {
          name: e.get("name"),
          iconURL: e.get("iconURL"),
          id: e.id,
          protocol: e,
        };
      });
    },
    sentAlerts(): Record<string, string | number | null | Alert>[] {
      return alertsModule.sentAlerts.map((v) => {
        return {
          date: v.get("createdAt"),
          protocol: v.get("protocol"),
          content: v.get("content"),
          type: v.get("type"),
          id: v.id,
          record: v,
        };
      });
    },
  },
  methods: {
    async fetchSubGeneralTypes(): Promise<void> {
      const q = new Moralis.Query("GeneralSubscriptionTypes");
      if (this.selectedProtocol) {
        q.equalTo("protocol", this.selectedProtocol.get("name"));
        const res = await q.find();
        this.subGeneralTypes = res.map((e: SubscriptionType) => {
          return {
            type: e.get("type"),
            name: e.get("name"),
          };
        });
        if (this.subGeneralTypes.length == 1) {
          this.newType = this.subGeneralTypes[0].type;
        }
      }
    },
    async add(): Promise<void> {
      console.log(`Add Alert`);
      const c = Alert.spawn(this.newType, this.newContent);
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
  },
});
</script>

<style scoped></style>
