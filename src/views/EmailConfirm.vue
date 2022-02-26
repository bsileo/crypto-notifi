<template>
  <Header></Header>
  <div class="container p-3 gutter--md">
    <div class="container">
      <div class="row pb-4">
        <div class="large flex sm8">
          <div v-if="loading">Verifying email address...</div>
          <div v-if="!loading">
            <div v-if="success">
              Your email was confirmed. You can now continue with
              <a href="/subscription/new">setting up subscriptions</a> to use
              this email.
            </div>
            <div v-if="!success">
              Email confirmation failed. Please try again.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";
import { useRoute } from "vue-router";
import Moralis from "moralis";
import { onMounted, ref } from "vue";

const route = useRoute();
const success = ref(false);
const loading = ref(true);

onMounted(async () => {
  const params = { code: route.query.code };
  let res = false;
  try {
    res = await Moralis.Cloud.run("confirmEmail", params);
  } catch (e) {
    res = false;
  }
  console.log(res);
  success.value = res;
  loading.value = false;
});
</script>

<style scoped>
.large {
  font-size: larger;
}
</style>
