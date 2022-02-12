import EmailCategory from "./EmailCategoryWidget.ce.vue";
import Test from "./Test.ce.vue";
import EmailCategory2 from "./EmailCategoryWidget.vue";
import { createApp, defineCustomElement, defineComponent } from 'vue'
import "vuestic-ui/dist/vuestic-ui.css";
import MoralisConfig from "@/config/moralis";
import { VuesticPlugin } from "vuestic-ui";

const ExampleElement = defineCustomElement(Test);
const EmailCategoryWidget = defineCustomElement(EmailCategory);


export { EmailCategoryWidget };

export function register(): void {
  window.customElements.define("notifi-email-category", EmailCategoryWidget);
  window.customElements.define("test-component", ExampleElement);
}

register();

import App from "./app.vue";
const app = createApp(App);
app.config.globalProperties.$moralis = MoralisConfig;
app.provide("Moralis", app.config.globalProperties.$moralis);

app.use(VuesticPlugin);

app.mount("#app");