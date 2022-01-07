<template>
  <div>
    <div class="flex sm12">
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
import { subscriptionsModule } from "@/store/subscription";
import { SubscriptionType } from "@/models/Subscription";

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
      showHistory: false,
      showSuccess: false,
      sortBy: "date",
      sortingOrder: "desc",
    };
  },
  computed: {
    validSubmit(): boolean {
      return this.newType != "" && this.newContent != "";
    },
    subGeneralTypes(): SubscriptionType[] {
      return subscriptionsModule.SUBSCRIPTIONTYPES.map((e) => {
        return {
          type: e.get("type"),
          name: e.get("name"),
        };
      });
    },
    sentAlerts(): Record<string, string | number | null | Alert>[] {
      return alertsModule.sentAlerts.map((v) => {
        return {
          date: v.get("createdAt"),
          content: v.get("content"),
          type: v.get("type"),
          id: v.id,
          record: v,
        };
      });
    },
  },
  methods: {
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
