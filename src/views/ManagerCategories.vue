<template>
  <div class="row">
    <div
      class="flex sm12 md6 lg4 mr-2 pb-3"
      v-bind:key="category.id"
      v-for="category in subCategories"
    >
      <EditCategory
        :category="category"
        :protocol="selectedProtocol"
        @update:name="updateCategoryName"
        @update:description="updateCategoryDescription"
        @deactivated="deactivateCategory"
      ></EditCategory>
    </div>
    <div class="flex sm12 md6 lg4 mr-2 pb-3">
      <EditCategory
        :protocol="selectedProtocol"
        @added="addedCategory"
      ></EditCategory>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import EditCategory from "@/components/EditCategory.vue";
import { Protocol } from "@/models/Protocol";
import { fetchProtocol, protocolUpdate } from "@/composables/getProtocolByID";
import Moralis from "moralis";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});
const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);

const subCategories = ref<SubscriptionType[]>([]);

const fetchsubCategories = async (): Promise<void> => {
  const q = new Moralis.Query(SubscriptionType);
  if (selectedProtocol.value) {
    q.equalTo("protocol", selectedProtocol.value);
    q.equalTo("status", SubscriptionTypeStatus.active);
    const res = await q.find();
    subCategories.value.length = 0;
    subCategories.value.push(...res);
  }
};

const updateCategoryName = async (): Promise<void> => {
  fetchsubCategories();
};
const updateCategoryDescription = async (): Promise<void> => {
  fetchsubCategories();
};
const addedCategory = async (): Promise<void> => {
  fetchsubCategories();
};
const deactivateCategory = async (): Promise<void> => {
  fetchsubCategories();
};

await fetchsubCategories();
</script>

<style scoped></style>
