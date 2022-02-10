import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";

import { ChannelModel, UserChannel } from "@/models/Channel";
import Moralis from "@/config/moralis";

@Module({ dynamic: true, store: store, namespaced: true, name: "Channels" })
export class ChannelsModule extends VuexModule {
  CHANNELS: Array<ChannelModel> = [
    { id: "twilio", name: "SMS", multiple: true },
    { id: "email", name: "Email", multiple: true },
    { id: "telegram", name: "Telegram", multiple: true },
  ];
  MYCHANNELS: Array<UserChannel> = [];

  get myChannels(): Array<UserChannel> {
    return this.MYCHANNELS;
  }

  get channels(): Array<ChannelModel> {
    return this.CHANNELS;
  }

  @Mutation
  public ADD_MY_CHANNEL(channel: UserChannel): void {
    this.MYCHANNELS.push(channel);
    channel.initialize();
  }

  @Mutation
  public SetMyChannels(channels: UserChannel[]): void {
    this.MYCHANNELS = channels;
    channels.forEach((c: UserChannel) => {
      c.initialize();
    });
  }

  @Action
  public AddMyChannel(channel: UserChannel): void {
    this.context.commit("ADD_MY_CHANNEL", channel);
  }
}

export const channelsModule = getModule(ChannelsModule);

const query = new Moralis.Query("UserChannel");

export const refreshChannels = (): void => {
  query.find().then((results: Array<UserChannel>) => {
    console.log("Initial objects created");
    channelsModule.SetMyChannels(results);
  });
};

export const setupMyChannelsSub = async (): Promise<void> => {
  const u = Moralis.User.current();
  if (!u) return;
  query.equalTo("User", u);
  const subscription = await query.subscribe();
  subscription.on("open", () => {
    query.find().then((results: Array<UserChannel>) => {
      channelsModule.SetMyChannels(results);
    });
  });
  subscription.on("create", (object: UserChannel) => {
    console.log(`UserChannel object created - add it = ${object.id}`);
    refreshChannels();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: UserChannel) => {
    // console.log("object updated");
    refreshChannels();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: UserChannel) => {
    // console.log("object entered");
    refreshChannels();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: UserChannel) => {
    // console.log("object left");
    refreshChannels();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: UserChannel) => {
    // console.log("object deleted");
    refreshChannels();
  });
  subscription.on("close", () => {
    console.log("UserChannel subscription closed");
  });
};
setupMyChannelsSub();
