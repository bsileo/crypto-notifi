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
import { SubscriptionType } from "@/models/SubscriptionType";
import { NotifiUser } from "@/models/NotifiUser";
import Moralis from "moralis";
import { computed, onMounted, ref } from "vue";

interface UserResult {
  user: NotifiUser;
  status: "new" | "existing";
}

export default {
  name: "EmailCategoryWidget",
  components: {},
  props: {
    protocol: { type: String, required: true },
  },
  setup: (props: any): any => {
    const email = ref("");
    const types = ref<SubscriptionType[]>([]);
    const selectedType = ref("");
    const prot = ref(undefined as Protocol | undefined);
    const alertMessage = ref("");
    const showAlert = ref(false);

    const allowSubscribe = computed(() => {
      return selectedType.value !== "" && validEmail.value;
    });

    const selectedSubscriptionType = computed(() => {
      return types.value.find((e: any) => e.id == selectedType.value);
    });

    const validEmail = computed(() => {
      if (/(.+)@(.+){2,}\.(.+){2,}/.test(email.value)) {
        return true;
      } else {
        return false;
      }
    });

    onMounted(() => {
      fetchSubscriptionTypes();
      fetchProtocol();
    });

    const fetchProtocol = async (): Promise<void> => {
      const id = props.protocol;
      const q = new Moralis.Query(Protocol);
      q.equalTo("objectId", id);
      const res = await q.find();
      if (res.length > 0) {
        prot.value = res[0];
      }
    };

    const fetchSubscriptionTypes = async (): Promise<void> => {
      const id = props.protocol;
      if (id) {
        const res = await SubscriptionType.typesForProtocolID(id);
        types.value = res;
      } else {
        types.value = [];
      }
    };


    const subscribe = async (): Promise<void> => {
      const { user: u, status: stat } = await createFetchAccount();
      //const subName = "Widget Subscription";
      if (u && prot.value && selectedSubscriptionType.value) {
        /* const sub = await Subscription.widgetSpawn(
          this.prot,
          subName,
          u,
          this.selectedSubscriptionType
        );*/
        if (stat == "new") {
          alertMessage.value = "Subscription Created. Please verify your email.";
        } else {
          alertMessage.value = "Subscription Created for existing email.";
        }
        showAlert.value = true;
      } else {
        alertMessage.value = "Subscription creation failed";
        showAlert.value = true;
      }
      setTimeout(() => (showAlert.value = false), 3000);
      return;
    };

    const getRandomPassword = (): string => {
      var chars =
        "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var passwordLength = 12;
      var password = "";
      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      return password;
    };

    const createFetchAccount = async (): Promise<UserResult> => {
      const qUser = new Moralis.Query(Moralis.User);
      qUser.equalTo("email", email.value);
      const users = await qUser.find();
      if (users.length > 0) {
        return { user: users[0], status: "existing" };
      }

      const user = new Moralis.User();
      user.set("username", email.value);
      user.set("password", getRandomPassword());
      user.set("email", email.value);

      try {
        await user.signUp();
        console.log("Sign-up complete!");
      } catch (error: any) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
      return { user: user, status: "new" };
    };

    return {
      email,
      types,
      selectedType,
      prot,
      alertMessage,
      showAlert,
      allowSubscribe,
      validEmail,
      selectedSubscriptionType,
      subscribe
    };
  }
};
</script>

<style scoped>
.powered {
  font-size: x-small;
  font-style: italic;
}
</style>
