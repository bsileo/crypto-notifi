<template>
  <div class="container p-3 gutter--md">
    <Header></Header>
    <div class="container">
      <div class="row pb-4">
        <div class="large flex sm8">
          <p>
            Notifi allows you to create proactive alerts for all the best
            protocols in Web3. Ad hoc alerts keep you updated on the latest
            happenings in your favorite platforms, while transactional alerts
            allow you to subscribe to individual events on the blockchain. Never
            miss a key event again - you can get a text message, email, or other
            alert whenever a transfer happens, a vote occurs, or a new proposal
            is approved on your favorite chains and protocols.
          </p>
          <va-divider></va-divider>
          <strong class="pt-5 pb-5">Login now to get started for free!</strong>
          <va-divider></va-divider>
          <p>
            Proactive alerts help you keep ahead in DeFi! Simply stake tokens in
            these leading platforms for free access to updates and contract
            alerts for participating protocols! Stake your tokens to get access
            to proactive wallet alerts to keep an eye on your funds.
          </p>
        </div>
        <div class="flex sm4">
          <div class="layout gutter-md" style="max-width: 300px">
            <div class="row pb-3">
              <div class="flex">
                <va-button color="primary" @click.prevent="metamaskLogin">
                  Login with MetaMask
                </va-button>
              </div>
            </div>
            <div class="row pb-3">
              <div class="flex">
                <va-popover
                  message="Coming Soon"
                  color="primary"
                  placement="right"
                >
                  <va-button
                    color="primary"
                    @click.prevent="walletConnectLogin"
                  >
                    Login with WalletConnect
                  </va-button>
                </va-popover>
              </div>
            </div>
            <div class="row pb-3">
              <div class="flex">
                <va-popover
                  message="Coming Soon"
                  color="primary"
                  placement="right"
                >
                  <va-button
                    color="primary"
                    style="float: right"
                    @click.prevent="emailLogin"
                  >
                    Login with Email
                  </va-button>
                </va-popover>
              </div>
            </div>
          </div>
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
import { NotifiUser } from "../models/NotifiUser";
import { userModule } from "../store/user";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import Header from "@/components/header.vue";

export default defineComponent({
  name: "Login",
  components: { ProtocolSelector, Header },
  methods: {
    async walletConnectLogin(): Promise<void> {
      return;
    },
    async emailLogin(): Promise<void> {
      return;
    },
    async metamaskLogin(): Promise<void> {
      try {
        Moralis.authenticate({
          signingMessage: "Sign to create an account on CryptoNotifi",
        });
        const user: any = await this.$moralis.Web3.authenticate();
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
