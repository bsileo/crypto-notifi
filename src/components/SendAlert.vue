<template>
  <div class="flex sm12 mb-3">
    <div class="row pt-2">
      <va-select
        class="flex sm12"
        label="Type of Alert"
        v-model="newCategory"
        :options="subCategories"
        value-by="id"
        :text-by="(option) => option.name"
        :rules="[(newCategory) => newCategory != null || 'Select a category']"
      />
    </div>
    <div class="row pt-2">
      <va-tabs v-model="textType">
        <template #tabs>
          <va-tab name="plain">Plain</va-tab>
          <va-tab name="rich">Rich</va-tab>
        </template>
      </va-tabs>
      <va-input
        v-if="textType == 'plain'"
        class="mb-1"
        v-model="newContent"
        type="textarea"
        label="Enter Plain Text Alert Content"
      />
      <div class="editor" v-if="textType == 'rich'">
        <editor
          api-key="582k9lowpc19oacd180hsqwlq73pavp5uvuet95zgras454q"
          v-model="newRichContent"
          :init="{
            height: 200,
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic backcolor | \ alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help',
            menu: {
              file: {
                title: 'File',
                items: 'newdocument restoredraft | preview ',
              },
              edit: {
                title: 'Edit',
                items: 'undo redo | cut copy paste | selectall | searchreplace',
              },
              view: {
                title: 'View',
                items:
                  'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen',
              },
              insert: {
                title: 'Insert',
                items:
                  'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
              },
              format: {
                title: 'Format',
                items:
                  'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
              },
              tools: {
                title: 'Tools',
                items: 'spellchecker spellcheckerlanguage | code wordcount',
              },
              table: {
                title: 'Table',
                items: 'inserttable | cell row column | tableprops deletetable',
              },
              help: { title: 'Help', items: 'help' },
            },
          }"
        />
      </div>
    </div>
    <div class="pt-3 pl-5">
      <va-button
        style=""
        :disabled="!validSubmit"
        @click.prevent="send"
        color="danger"
        icon-right="create"
        size="medium"
        >Send Alert</va-button
      >
      <va-alert
        color="success"
        closeable
        class="flex sm9"
        v-model="showSuccess"
      >
        Alert sent
      </va-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { Alert, AlertContent } from "@/models/Alert";
import { Protocol } from "@/models/Protocol";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import Moralis from "moralis";
import { defineComponent } from "vue";
import Editor from "@tinymce/tinymce-vue";

export default defineComponent({
  name: "SendAlert",
  props: {
    protocol: {
      type: Protocol,
      required: false,
    },
  },
  components: { Editor },
  emits: ["alert:sent"],
  data() {
    return {
      newCategory: undefined as string | undefined,
      newContent: "",
      newRichContent: "",
      subCategories: [] as SubscriptionType[],
      showSuccess: false,
      textType: "plain",
    };
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protocol(newPro: Protocol, oldProt: Protocol) {
      this.fetchsubCategories();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newContent(newCont: string, oldCont: string) {
      if (this.newRichContent == "") {
        console.log("Set Rich");
      }
    },
  },
  computed: {
    validSubmit(): boolean {
      return this.newCategory != undefined && this.newContent != "";
    },
    content(): AlertContent {
      return {
        plain: this.newContent,
        rich: this.newRichContent,
      };
    },
  },
  methods: {
    async fetchsubCategories(): Promise<void> {
      const q = new Moralis.Query(SubscriptionType);
      if (this.protocol) {
        q.equalTo("protocol", this.protocol);
        q.equalTo("status", SubscriptionTypeStatus.active);
        const res = await q.find();
        this.subCategories = res;
        if (this.subCategories.length == 1) {
          this.newCategory = this.subCategories[0].id;
        }
      }
    },
    async send(): Promise<void> {
      if (this.newCategory == undefined) {
        alert("Select a category");
        return;
      }

      // Hack fix because the result of the selection does not have correct bahavior
      const cat: SubscriptionType | undefined = this.subCategories.find(
        (e) => e.id == this.newCategory);
      if (!cat) {
        return;
      }

      const c = Alert.spawn(cat, this.content, this.protocol);
      if (this.newRichContent != null) {
        c.set("richContent", this.newRichContent);
      }
      c.save().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: Alert) => {
          // Execute any logic that should take place after the object is saved.
          this.newContent = "";
          this.$emit("alert:sent");
        },
        (error: { message: string }) => {
          // Execute any logic that should take place if the save fails.
          // error is a Moralis.Error with an error code and message.
          alert(
            "Failed to create new object, with error code: " + error.message
          );
        }
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>
