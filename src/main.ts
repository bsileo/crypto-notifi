import { createApp } from "vue";
import App from "./App.vue";
import * as dotenv from "dotenv";
import MoralisConfig from "./config/moralis";
import router from "./router";
import Web3 from "web3";
import "./custom-declarations";

import { store, key } from "./store";

import { VuesticPlugin } from "vuestic-ui";
import "vuestic-ui/dist/vuestic-ui.css";


dotenv.config();

const app = createApp(App);

const web3 = new Web3();

app.config.globalProperties.$moralis = MoralisConfig;
app.config.globalProperties.$web3 = web3;

//import { OneSignalVue3Plugin } from "onesignal-vue";
//app.config.globalProperties.$OneSignal = OneSignalVue3Plugin;
//app.use(OneSignalVue3Plugin);

app.use(router);
app.use(VuesticPlugin);
app.use(store, key);

app.mount("#app");
