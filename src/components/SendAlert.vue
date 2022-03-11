<template>
  <div class="flex sm12 mb-3">
    <div class="row pt-2">
      <va-select
        class="flex xs12 sm8 md6 lg4"
        label="Type of Alert"
        v-model="newCategory"
        :options="subCategories"
        value-by="id"
        :text-by="(option) => option.name"
        :rules="[(newCategory) => newCategory != null || 'Select a category']"
      />
    </div>
    <div v-if="subCategories.length == 0" class="row pl-4">
      <div class="flex xs12 sm6 md6 lg4">
        You must define at least one Category before you can send adhoc alerts.
      </div>
    </div>
    <div class="row pt-2 pl-2" v-show="showPlain">
      <div class="row pt-2 pb-2">
        <h1>Enter Plain Content:</h1>
      </div>
      <va-input
        class="mb-1"
        v-model="newContent"
        type="textarea"
        autosize
        :min-rows="6"
        label="Enter Plain Text Alert Content"
      />
      <div v-show="showRich" class="pl-2">
        <div class="row pt-2 pb-2">
          <h1>
            Enter Rich Text Content:&nbsp;
            <span style="font-size: small">(optional)</span>
          </h1>
        </div>
        <div class="editor">
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
                  items:
                    'undo redo | cut copy paste | selectall | searchreplace',
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
                  items:
                    'inserttable | cell row column | tableprops deletetable',
                },
                help: { title: 'Help', items: 'help' },
              },
            }"
          />
        </div>
      </div>
    </div>
    <div class="pt-3 pl-2">
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

<script setup lang="ts">
import { Alert, AlertContent } from "@/models/Alert";
import { Protocol } from "@/models/Protocol";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import Moralis from "moralis";
import Editor from "@tinymce/tinymce-vue";
import { computed, ref } from "vue";

/* global defineProps, defineEmits */
const props = defineProps({
  protocol: {
    type: Protocol,
    required: true,
  },
});
const emit = defineEmits(["alert:sent"]);

const newCategory = ref<string | undefined>("");
const newContent = ref("");
const newRichContent = ref("");
const subCategories = ref<SubscriptionType[]>([]);
const showSuccess = ref(false);

const validSubmit = computed((): boolean => {
  return newCategory.value != undefined && newContent.value != "";
});

const content = computed((): AlertContent => {
  return {
    plain: newContent.value,
    rich: newRichContent.value,
  };
});

const showPlain = computed((): boolean => {
  return subCategories.value.length > 0;
});

const showRich = computed((): boolean => {
  return subCategories.value.length > 0;
});

const fetchsubCategories = async (): Promise<void> => {
  const q = new Moralis.Query(SubscriptionType);
  if (props.protocol) {
    q.equalTo("protocol", props.protocol);
    q.equalTo("status", SubscriptionTypeStatus.active);
    const res = await q.find();
    subCategories.value = res;
    if (subCategories.value.length == 1) {
      newCategory.value = subCategories.value[0].id;
    }
  }
};

fetchsubCategories();

const send = async (): Promise<void> => {
  if (newCategory.value == undefined) {
    alert("Select a category");
    return;
  }

  // Hack fix because the result of the selection does not have correct bahavior
  const cat: SubscriptionType | undefined = subCategories.value.find(
    (e) => e.id == newCategory.value
  );
  if (!cat) {
    return;
  }

  const c = Alert.spawn(cat, content.value, props.protocol);
  if (newRichContent.value != null) {
    c.set("richContent", newRichContent.value);
  }
  c.save().then(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (uc: Alert) => {
      // Execute any logic that should take place after the object is saved.
      newContent.value = "";
      newRichContent.value = "";
      emit("alert:sent");
    },
    (error: { message: string }) => {
      // Execute any logic that should take place if the save fails.
      // error is a Moralis.Error with an error code and message.
      alert("Failed to create new object, with error code: " + error.message);
    }
  );
};
</script>

<style scoped lang="scss"></style>
