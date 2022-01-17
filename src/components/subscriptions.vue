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
        <template #header(description)>Summary</template>
        <template #cell(description)="{ source: description }">
          <span
            style="width: 50px; overflow: hidden; text-overflow: ellipsis"
            v-html="description"
          ></span>
        </template>
        <template #cell(id)="{ source: id }">
          <va-button
            @click.prevent="remove(id)"
            icon-right="delete"
            size="small"
            class="mr-1"
          ></va-button
          ><va-button
            @click.prevent="edit(id)"
            v-if="false"
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
          color="success"
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
      { key: "subscriptionDescriptor", label: "Type", sortable: true },
      { key: "channelNames", label: "Channels", sortable: false },
      { key: "description", label: "Description", sortable: false },
    ];
    const subs: Subscription[] = [];
    return {
      validation: null,
      columns: columns,
      selected: subs,
      showSubscribe: false,
    };
  },
  mounted() {
    //this.fetchSubscriptions();
  },
  emits: ["subscribe"],
  computed: {
    subscriptions(): Subscription[] {
      return subscriptionsModule.mySubscriptions;
    },
    selectedSubscription(): Subscription | null {
      if (this.selected.length == 0) return null;
      return this.selected[0].subscription;
    },
    allowEdit(): boolean {
      return this.selected.length == 1;
    },
    allowRemove(): boolean {
      return this.selected.length > 0;
    },
  },
  methods: {
    edit(id: string): void {
      console.log(`Edit ${id}`);
      this.showSubscribe = true;
    },
    remove(id: string): void {
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
