import EmailCategoryWidget from './src/components/EmailCategoryWidget.ce.vue';
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

import { defineCustomElement } from "vue";

const EmailCategory = defineCustomElement(EmailCategoryWidget);
export { EmailCategory }

export function register() {
  customElements.define("notifi-email-category", EmailCategory);
}