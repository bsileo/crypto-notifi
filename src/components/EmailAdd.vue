<template>
  <div class="flex sm12">
    <div class="row pt-2">
      <va-input class="mb-2" @change="updateProviderData()"
        @keyup="updateProviderData()"
        v-model="email"
        label="Enter Email Address"
        placeholder="user@gmail.com"
        :error="!this.valid"
      />
    </div>
    <div v-if="noDefault" class="row">
      <va-checkbox
        @changed="updateProviderData"
        v-model="setDefault"
        label="Make this my default email"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Email",
  components: {},
  emits: ["providerData"],
  data() {
    return {
      email: "",
      setDefault: true,
      noDefault: false,
    };
  },
  async onMount(): Promise<boolean> {
     const val: any = await Moralis.Cloud.run("emailVerified");
    this.noDefault = val;
     return val;
  },
  computed: {
    noDefaultOld(): boolean {
      const u = Moralis.User.current();
      const em = u.get("email");
      return !em;
    },
    validEmail(): boolean {
      if (/(.+)@(.+){2,}\.(.+){2,}/.test(this.email)) {
        return true;
      } else {
        return false;
      }
    },
    valid(): boolean {
      return this.validEmail;
    },
    providerdata(): Record<string, string | boolean | undefined> {
      return {
        email: this.email,
        setDefault: this.noDefault && this.setDefault,
      };
    },
  },
  methods: {
    updateProviderData(): void {
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
