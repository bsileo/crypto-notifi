<template>
  <va-card color="primary" gradient style="align-items: stretch">
    <va-card-title>
      <div class="container">
        <div class="flex md-4">
          <h2>Subscriptions</h2>
        </div>
      </div>
    </va-card-title>
    <va-card-content>
      <va-data-table
        :items="subscriptions"
        :columns="columns"
        v-model="selected"
      >
        <template #header(name)>Name</template>
        <template #header(id)></template>
        <template #header(subscriptionType)>Type</template>
        <template #header(channels)>Channels</template>
        <template #header(fromAddress)>From Address</template>
        <template #header(toAddress)>To Address</template>
        <template #cell(id)="{ source: id }">
          <va-button
            @click.prevent="remove(id)"
            icon-right="delete"
            size="small"
            class="mr-1"
          ></va-button
          ><va-button
            @click.prevent="edit(id)"
            icon-right="edit"
            size="small"
            class="mr-2"
          ></va-button
        ></template>
      </va-data-table>
      <div class="flex pl-2 pt-3">
        <va-button
          @click.prevent="this.$emit('subscribe')"
          icon-right="add"
          size="small"
          class="mr-4"
        ></va-button>
      </div>
    </va-card-content>
  </va-card>
  <va-modal
    fullscreen
    hide-default-actions
    v-model="showSubscribe"
    title="Update this Subscription"
  >
    <slot>
      <Subscribe
        :subscription="selectedSubscription"
        @saved="showSubscribe = false"
      ></Subscribe>
    </slot>
  </va-modal>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";
import { Subscription } from "@/models/Subscription";
import { subscriptionsModule } from "@/store/subscription";
import Subscribe from "@/components/subscribe.vue";

export default defineComponent({
  name: "Subscriptions",
  components: { Subscribe },
  props: {
    showAdd: Boolean,
  },
  data() {
    const columns = [
      { key: "id", label: "", sortable: false },
      { key: "name", label: "Name", sortable: true },
      { key: "subscriptionType", label: "Type", sortable: true },
      { key: "channels", label: "Channels", sortable: false },
      { key: "fromAddress", label: "From", sortable: true },
      { key: "toAddress", label: "To", sortable: true },
    ];
    const subs: Subscription[] = [];
    return {
      validation: null,
      columns: columns,
      selected: subs,
      showSubscribe: false,
    };
  },
  emits: ["subscribe"],
  computed: {
    selectedSubscription(): Subscription | null {
      if (this.selected.length == 0) return null;
      return this.selected[0].subscription;
    },
    subscriptions(): Record<string, string | number | Subscription>[] {
      return subscriptionsModule.mySubscriptions.map((v: Subscription) => {
        let typ = v.get("subscriptionType");
        if (typ === "General") {
          typ = `${typ} (${v.get("generalType")})`;
        }
        return {
          name: v.attributes["name"],
          subscriptionType: typ,
          fromAddress: v.attributes["fromAddress"],
          toAddress: v.attributes["toAddress"],
          id: v.id,
          subscription: v,
        };
      });
    },
    allowEdit(): boolean {
      return this.selected.length == 1;
    },
    allowRemove(): boolean {
      return this.selected.length > 0;
    },
  },
  methods: {
    edit(): void {
      console.log("Edit");
      this.showSubscribe = true;
    },
    remove(): void {
      const id = this.selected[0].id;
      console.log(`remove ${id}`);
      const query = new Moralis.Query("Subscription");
      query.get(id).then((s: { destroy: () => Promise<unknown> }) => {
        s.destroy().then((oldS) => {
          console.log(`Success remove ${oldS}`);
        });
      });
    },
  },
});
</script>

<style scoped></style>
