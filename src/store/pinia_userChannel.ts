import { UserChannel } from "@/models/Channel";
import Moralis from "moralis";
import { ChannelModel, UserChannelStatus } from "@/notifi_types";
import { defineStore } from "pinia";

export const useUserChannelsStore = defineStore("userChannels", {
  state: () => {
    return {
      definedChannels: [
        { id: "twilio", name: "SMS", multiple: true } as ChannelModel,
        { id: "email", name: "Email", multiple: true } as ChannelModel,
        { id: "telegram", name: "Telegram", multiple: true } as ChannelModel,
      ],
      userChannels: [] as Array<UserChannel>,
      query: undefined as any,
      loading: false,
    };
  },
  getters: {
    activeChannels(): Array<UserChannel> {
      return this.userChannels.filter((c: UserChannel) => {
        return c.status == UserChannelStatus.active;
      });
    },
    activeEmailChannels(): Array<UserChannel> {
      return this.userChannels.filter((c: UserChannel) => {
        return (
          c.status == UserChannelStatus.active && c.providerName == "Email"
        );
      });
    },
  },
  actions: {
    AddUserChannel(channel: UserChannel): void {
      const index = this.userChannels.findIndex(
        (e: UserChannel) => e.id == channel.id
      );
      if (index > -1) {
        this.userChannels.splice(index, 1, channel);
      } else {
        this.userChannels.push(channel);
      }
    },
    RemoveUserChannel(channel: UserChannel): void {
      const index = this.userChannels.findIndex((e) => e.id == channel.id);
      if (index > -1) {
        this.userChannels.splice(index, 1);
      }
    },
    SetUserChannels(channels: UserChannel[]): void {
      this.userChannels.length = 0;
      this.userChannels.push(...channels);
      channels.forEach((c: UserChannel) => {
        c.initialize();
      });
    },
    async setupChannels(): Promise<void> {
      this.loading = true;
      if (this.query) return;
      const u = Moralis.User.current();
      if (!u) {
        this.SetUserChannels([]);
        this.loading = false;
        return;
      }
      const query = new Moralis.Query("UserChannel");
      query.equalTo("User", u);
      const chans = await query.find();
      this.SetUserChannels(chans);
      this.query = query;
      this.subscribe();
      this.loading = false;
    },
    async subscribe() {
      if (!this.query) return;
      const subscription = await this.query.subscribe();
      subscription.on("open", () => {
        this.query.find().then((results: Array<UserChannel>) => {
          this.SetUserChannels(results);
        });
      });
      subscription.on("create", (chan: UserChannel) => {
        this.AddUserChannel(chan);
      });
      subscription.on("update", (chan: UserChannel) => {
        this.AddUserChannel(chan);
      });
      subscription.on("enter", (chan: UserChannel) => {
        this.AddUserChannel(chan);
      });
      subscription.on("leave", (chan: UserChannel) => {
        this.RemoveUserChannel(chan);
      });
      subscription.on("delete", (chan: UserChannel) => {
        this.RemoveUserChannel(chan);
      });
    },
  },
});
