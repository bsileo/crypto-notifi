<template>
  <div class="flex sm12">
    <div class="row pt-2">
      <va-input
        class="mb-4"
        @change="updateProviderData()"
        @keyup="updateProviderData()"
        v-model="newNumber"
        label="Enter Phone Number"
        placeholder="412.555.1212"
        :error="!this.valid"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Twilio",
  components: {},
  emits: ["providerData"],
  data() {
    return {
      newNumber: "",
    };
  },
  computed: {
    validNumber(): boolean {
      return this.newNumber != "" && this.newNumber.length > 9;
    },
    valid(): boolean {
      return this.validNumber;
    },
    providerdata(): Record<string, string | undefined> {
      return {
        to: this.newNumber,
      };
    },
  },
  methods: {
    updateProviderData(): void {
      console.log(`Update PD ${this.valid}--${this.providerdata}`);
      if (this.valid) {
        this.$emit("providerData", this.providerdata);
      } else {
        this.$emit("providerData", null);
      }
    },
  },
});
</script>

<style scoped></style>
