<template>
  <div class="container p-3 gutter--md" style="max-width: 300px">
    <div class="container">
      <div class="row pb-2">
        <h3>Sign up for Alerts</h3>
      </div>
      <div class="row pb-2">
        <va-input label="Email Address" v-model="email"></va-input>
      </div>
      <div class="row pb-2">
        <va-select
          v-model="selectedType"
          label="Category"
          value-by="id"
          track-by="id"
          text-by="name"
          :options="types"
        >
        </va-select>
      </div>
      <div>
        <va-button
          size="medium"
          color="primary"
          :disabled="!allowSubscribe"
          @click.prevent="subscribe"
        >
          Subscribe
        </va-button>
      </div>
      <div>
        <va-alert closeable v-model="showAlert" dense>
          {{ alertMessage }}
        </va-alert>
      </div>
    </div>
    <va-divider></va-divider>
    <p class="powered">
      Powered by <a href="https://cryptonotifi.xyz">Notifi</a>
    </p>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { Subscription } from "@/models/Subscription";
import { SubscriptionType } from "@/models/SubscriptionType";
import { NotifiUser } from "@/models/NotifiUser";
import Moralis from "moralis";
import { defineComponent } from "vue";

interface UserResult {
  user: NotifiUser;
  status: "new" | "existing";
}

export default defineComponent({
  name: "Widget",
  components: {},
  data() {
    return {
      email: "",
      types: [] as SubscriptionType[],
      selectedType: "",
      prot: undefined as Protocol | undefined,
      alertMessage: "",
      showAlert: false,
    };
  },
  mounted() {
    this.fetchSubscriptionTypes();
    this.fetchProtocol();
  },
  computed: {
    allowSubscribe(): boolean {
      return this.selectedType !== "" && this.validEmail;
    },
    validEmail(): boolean {
      if (/(.+)@(.+){2,}\.(.+){2,}/.test(this.email)) {
        return true;
      } else {
        return false;
      }
    },
    selectedSubscriptionType(): SubscriptionType | undefined {
      return this.types.find((e) => e.id == this.selectedType);
    },
  },
  methods: {
    async fetchProtocol(): Promise<void> {
      const id = this.$route.query.protocol as string;
      const q = new Moralis.Query(Protocol);
      q.equalTo("objectId", id);
      const res = await q.find();
      if (res.length > 0) {
        this.prot = res[0];
      }
    },
    async fetchSubscriptionTypes(): Promise<void> {
      const id = this.$route.query.protocol as string;
      if (id) {
        const res = await SubscriptionType.typesForProtocolID(id);
        this.types = res;
      } else {
        this.types = [];
      }
    },
    async subscribe(): Promise<void> {
      const { user: u, status: stat } = await this.createFetchAccount();
      const subName = "Widget Subscription";
      if (u && this.prot && this.selectedSubscriptionType) {

        /* const sub = await Subscription.widgetSpawn(
          this.prot,
          subName,
          u,
          this.selectedSubscriptionType
        );*/
        if (stat == "new") {
          this.alertMessage = "Subscription Created. Please verify your email.";
        } else {
          this.alertMessage = "Subscription Created for existing email.";
        }
        this.showAlert = true;
      } else {
        this.alertMessage = "Subscription creation failed";
        this.showAlert = true;
      }
      setTimeout(() => (this.showAlert = false), 3000);
      return;
    },
    getRandomPassword(): string {
      var chars =
        "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var passwordLength = 12;
      var password = "";
      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      return password;
    },
    async createFetchAccount(): Promise<UserResult> {
      const qUser = new Moralis.Query(Moralis.User);
      qUser.equalTo("email", this.email);
      const users = await qUser.find();
      if (users.length > 0) {
        return { user: users[0], status: "existing" };
      }

      const user = new Moralis.User();
      user.set("username", this.email);
      user.set("password", this.getRandomPassword());
      user.set("email", this.email);

      try {
        await user.signUp();
        console.log("Sign-up complete!");
      } catch (error: any) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
      return { user: user, status: "new" };
    },
  },
});
</script>

<style scoped>
.powered {
  font-size: x-small;
  font-style: italic;
}
</style>
