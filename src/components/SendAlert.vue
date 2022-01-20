<template>
  <div class="flex sm12 mb-3">
    <div class="row pt-2">
      <va-select
        class="flex sm12"
        label="Type of Alert"
        v-model="newCategory"
        :options="subCategories"
        track-by="id"
        text-by="name"
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
        <label class="inputtitle va-input--labeled va-input__label"
          >Enter Rich Text Alert Content</label
        >
        <EditorContent :editor="editor" />
      </div>
      <div v-if="editor">
        <bubble-menu
          class="bubble-menu"
          :tippy-options="{ duration: 100 }"
          :editor="editor"
        >
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
          >
            Bold
          </button>
          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
          >
            Italic
          </button>
          <button
            @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
          >
            Strike
          </button>
        </bubble-menu>

        <floating-menu
          class="floating-menu"
          :tippy-options="{ duration: 100 }"
          :editor="editor"
        >
          <button
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{
              'is-active': editor.isActive('heading', { level: 1 }),
            }"
          >
            H1
          </button>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{
              'is-active': editor.isActive('heading', { level: 2 }),
            }"
          >
            H2
          </button>
          <button
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }"
          >
            Bullet List
          </button>
        </floating-menu>
      </div>
    </div>
    <div>
      <va-button
        style="margin-left: 50px"
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
import { Alert } from "@/models/Alert";
import { Protocol } from "@/models/Protocol";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import Moralis from "moralis";
import { defineComponent } from "vue";
import { Editor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

export default defineComponent({
  name: "SendAlert",
  props: {
    protocol: {
      type: Protocol,
      required: false,
    },
  },
  components: { EditorContent, BubbleMenu, FloatingMenu },
  emits: ["alert:sent"],
  data() {
    return {
      newCategory: undefined as SubscriptionType | undefined,
      newContent: "",
      newRichContent: "",
      subCategories: [] as SubscriptionType[],
      showSuccess: false,
      textType: "plain",
      editor: null as null | Editor,
    };
  },
  mounted() {
    this.editor = new Editor({
      content: this.newRichContent,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.newRichContent = html;
      },
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight,
      ],
    });
  },
  beforeUnmount() {
    this.editor?.destroy();
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protocol(newPro: Protocol, oldProt: Protocol) {
      this.fetchsubCategories();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newContent(newCont: string, oldCont: string) {
      if (this.editor && this.newRichContent == "") {
        this.editor.commands.setContent(`<p>${newCont}</p>`);
      }
    },
  },
  computed: {
    validSubmit(): boolean {
      return this.newCategory != undefined && this.newContent != "";
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
          this.newCategory = this.subCategories[0];
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
        (e) => e.id == this.newCategory?.id
      );
      if (!cat) {
        return;
      }
      const c = Alert.spawn(cat, this.newContent, this.protocol);
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

<style lang="scss">
div.editor {
  min-height: 4em;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #f5f9fb;
  border-style: none;
  color: var(--va-input-text-color);
  font-family: inherit;
  font-size: var(--va-input-font-size);
  font-stretch: var(--va-input-font-stretch);
  font-style: var(--va-input-font-style);
  font-weight: var(--va-input-font-weight);
  letter-spacing: var(--va-input-letter-spacing);
  line-height: var(--va-input-line-height);
  outline: none;
  scrollbar-color: var(--va-input-scroll-color) transparent;
  scrollbar-width: thin;
  transform: translateY(-1px);
  width: 100%;
}

.inputtitle {
  color: rgb(44, 130, 224);
  display: block;
  font-size: var(--va-input-container-label-font-size);
  font-weight: var(--va-input-container-label-font-weight);
  height: 12px;
  left: 10;
  letter-spacing: var(
    --va-input-container-label-letter-spacing,
    var(--va-letter-spacing)
  );
  line-height: var(--va-input-container-label-line-height);
  max-width: var(--va-input-container-label-max-width);
  overflow: hidden;
  padding-top: 1px;
  position: absolute;
  text-overflow: ellipsis;
  text-transform: var(--va-input-container-label-text-transform);
  top: 0;
  //transform: translateY(-100%);
  transform-origin: top left;
  white-space: nowrap;
}
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
    margin-bottom: 10px;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }
}

.bubble-menu {
  display: flex;
  background-color: #0d0d0d;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}

.floating-menu {
  display: flex;
  background-color: #0d0d0d10;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}
</style>
