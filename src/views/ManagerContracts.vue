<template>
  <div class="row">
    <div class="ml-2 mt-2">
      <va-button @click="startAddContract" icon="add">Add Contract</va-button>
    </div>
    <div class="row ml-2">
      <va-card
        square
        outlined
        class="flex sm12 md4 lg3"
        v-bind:key="contract.id"
        v-for="contract in contracts"
      >
        <va-card-title>{{ contract.name }}</va-card-title>
        <div>
          <va-chip outline>{{ contract.chain }}</va-chip>
          {{ contract.short_address }}
        </div>
        <va-card-actions align="stretch">
          <va-button @click="editContract(contract)" icon="edit"></va-button>
        </va-card-actions>
      </va-card>
    </div>
    <div class="row">
      <div ref="editedContract" v-if="showAddContract" class="pl-3">
        <va-divider></va-divider>
        <EditContract
          @contractSaved="contractSaved"
          @cancel="showAddContract = false"
          @updated="scrollToContract"
          :contract="this.selectedContract"
          :protocol="this.selectedProtocol"
        ></EditContract>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";
import Moralis from "moralis";
import EditContract from "@/components/EditContract.vue";
import { Contract } from "@/models/Contract";

import { fetchProtocol, protocolUpdate } from "@/composables/getProtocolByID";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: true },
});
const selectedProtocol = ref<Protocol>(new Protocol());
selectedProtocol.value = await fetchProtocol(props.protocolID);

const contracts = ref<Contract[]>([]);
const selectedContract = ref<Contract>();
const showAddContract = ref(false);

const fetchContracts = async (): Promise<Contract[]> => {
  if (selectedProtocol.value) {
    const cons = await selectedProtocol.value.contracts();
    contracts.value.length = 0;
    contracts.value.push(...cons);
  } else {
    contracts.value.length = 0;
  }
  return contracts.value;
};

await fetchContracts();

const startAddContract = () => {
  selectedContract.value = new Contract();
  showAddContract.value = true;
  scrollToContract();
};
const editContract = (contract: Contract) => {
  selectedContract.value = contract;
  showAddContract.value = true;
  scrollToContract();
};
const contractSaved = () => {
  showAddContract.value = false;
  fetchContracts();
};

const editedContract = ref(null);
const scrollToContract = (): void => {
  const el: any = editedContract.value;
  if (el) {
    var top = el.offsetTop;
    window.scrollTo(0, top);
  }
};
</script>

<style scoped></style>
