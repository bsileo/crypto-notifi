<template>
  <Header></Header>
  <div class="container p-3 gutter--md">
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
                <va-button color="primary" @click.prevent="doLogin">
                  Login
                </va-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <va-divider></va-divider>
        <ProtocolSelector
          :showSearch="true"
          :showVote="false"
          :showSubscribe="false"
          :showUserInfo="false"
          :allowSelect="false"
          :showStatus="true"
          :showFavorites="false"
        ></ProtocolSelector>
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";
import { NotifiUser } from "../models/NotifiUser";
import { userModule } from "../store/user";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";
import Chain from "moralis"

export default defineComponent({
  name: "Login",
  components: { ProtocolSelector, Header, Footer },
  methods: {
    async doLogin(): Promise<void> {
      try {
       // const user = await Moralis.authenticate({
       //   signingMessage: "Sign to create an account on CryptoNotifi",
       // });
        const user = await Moralis.authenticate({
          provider: "web3Auth",
          theme: "light",
          clientId:
            "BNAltJRis6TNpbJxvM4WwENUZbgdzE5sGXZ8bCYYHEXlxTrtLVVxwe6WrX80y6IvH14l_clPo_Eqs7ay3TLGKow",
        });
        if (user) {
          const q = new Moralis.Query(NotifiUser);
          const newUser = await q.get(user.id);
          user.setACL(new Moralis.ACL(user));
          newUser.setACL(new Moralis.ACL(newUser));
          userModule.SET_USER(user);
          this.$router.push({ name: "Home" });
        }
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
