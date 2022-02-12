import { createApp } from "vue";
import App from "./App.vue";
import * as dotenv from "dotenv";
import MoralisConfig from "./config/moralis";
import router from "./router";
import "./custom-declarations";

import { store, key } from "./store";

import { VuesticPlugin } from "vuestic-ui";
import "vuestic-ui/dist/vuestic-ui.css";

dotenv.config();

const app = createApp(App);

app.config.globalProperties.$moralis = MoralisConfig;
app.provide("Moralis", app.config.globalProperties.$moralis);


app.use(router);
app.use(VuesticPlugin);
app.use(store, key);

app.mount("#app");
