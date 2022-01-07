<template>
  <div>
    <va-data-table
      :selectable="true"
      :select-mode="selectMode"
      v-model="selectedItems"
      :items="transactions"
      :columns="columns"
      :loading="isLoading"
    >
      <template #cell(block_hash)="{ source: block_hash }">
        <va-button @click.prevent="subscribe(block_hash)">Subscribe</va-button>
      </template>
      <template #cell(value)="{ source: value }"
        >{{ value / 1000000000 }}
      </template>
    </va-data-table>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis/types";
import { defineComponent } from "vue";
import { userModule } from "../store/user";
import { UserModel } from "@/models/User";

export default defineComponent({
  name: "Tranasactions",
  components: {},
  emits: ["subscribe"],
  props: {
    showTX: Boolean,
  },
  data() {
    let tx: Moralis.TransactionResult[] = [];
    return {
      isLoading: true,
      transactions: tx,
      selectMode: "single",
      selectedItems: [],
      columns: [
        { key: "block_timestamp", label: "Time stamp", sortable: true },
        { key: "from_address", label: "From Address", sortable: true },
        { key: "to_address", label: "To Address", sortable: true },
        { key: "value", label: "Value", sortable: true },
        { key: "gas", label: "Gas Used", sortable: true },
        { key: "block_hash", label: "Add Subscription", sortable: false },
      ],
    };
  },
  mounted() {
    this.fetchTransactions();
  },
  computed: {
    user(): UserModel {
      return userModule.user as UserModel;
    },
  },
  methods: {
    async fromWei(value: string): Promise<number> {
      return this.$moralis.Units.FromWei(value, 18);
    },
    async logout(): Promise<void> {
      await this.$moralis.User.logOut();
      this.$router.push({ name: "Login" });
    },
    async fetchTransactions(): Promise<void> {
      this.isLoading = true;
      const transactions: Moralis.TransactionResult[] = (
        await this.$moralis.Web3API.account.getTransactions({
          chain: "avalanche",
          address: this.user.attributes.ethAddress,
        })
      ).result as Moralis.TransactionResult[];
      this.transactions = transactions;
      this.isLoading = false;
    },
    getTransaction(id: string): Moralis.TransactionResult | undefined {
      return this.transactions.find(
        (e: Moralis.TransactionResult) => e.block_hash === id
      );
    },
    subscribe(id: string) {
      console.log(`Subscribe to ${id}`);
      const tx: Moralis.TransactionResult | undefined = this.getTransaction(id);
      this.$emit("subscribe", tx);
    },
  },
});
</script>

<style scoped></style>
