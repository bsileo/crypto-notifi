<template>
  <div class="container p-3 gutter--md">
    <Header></Header>
    <div class="container">
      <div class="row pb-5">
        <div class="large flex sm8">
          <p>
            Notifi allows you to create proactive alerts for all the best
            protocols in Web3. Ad hoc alerts keep you updated on the latest
            happens in your favorite platofmrs, while transactional alerts allow
            you to subscribe to individual events on the blockchain. Never miss
            a key event again - you can get a text, email, or other alert
            whenever a transfer happens, a vote occurs, or a new proposal is
            approved on all your favorite chains and protocols.
          </p>
          <va-divider></va-divider>
          <strong>Login now to get started for free!</strong>
        </div>
        <div class="flex sm4">
          <va-button @click.prevent="metamaskLogin">
            Login with MetaMask
          </va-button>
        </div>
      </div>
      <div class="row">
         <va-divider></va-divider>
        <ProtocolSelector :allowSelect="false"></ProtocolSelector>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";
import { UserModel } from "../models/User";
import { userModule } from "../store/user";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import Header from "@/components/header.vue"

export default defineComponent({
  name: "Login",
  components: { ProtocolSelector, Header },
  methods: {
    async metamaskLogin(): Promise<void> {
      try {
        Moralis.authenticate({
          signingMessage: "Sign to create an account on CryptoNotifi",
        });
        const user: UserModel = await this.$moralis.Web3.authenticate();
        user.setACL(new Moralis.ACL(user));
        userModule.SET_USER(user);
        //console.log(user);
        this.$router.push({ name: "Home" });
      } catch (error) {
        console.log({ error });
      }
    },
  },
});
</script>

<style scoped>
.large {
  font-size: larger;
}
</style>
