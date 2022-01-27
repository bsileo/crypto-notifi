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
    { id: "discord", name: "Discord", multiple: true },
    { id: "twilio", name: "Twilio", multiple: true },
    { id: "email", name: "Email", multiple: true },
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

const setupMyChannelsSub = async (): Promise<void> => {
  const query = new Moralis.Query("UserChannel");
  query.equalTo("userID", Moralis.User.current().id);
  const subscription = await query.subscribe();
  const refresh = (): void => {
    query.find().then((results: Array<UserChannel>) => {
      console.log("Initial objects created");
      channelsModule.SetMyChannels(results);
    });
  };
  subscription.on("open", () => {
    query.find().then((results: Array<UserChannel>) => {
      channelsModule.SetMyChannels(results);
    });
  });
  subscription.on("create", (object: UserChannel) => {
    console.log(`UserChannel object created - add it = ${object.id}`);
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: UserChannel) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: UserChannel) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: UserChannel) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: UserChannel) => {
    // console.log("object deleted");
    refresh();
  });
  subscription.on("close", () => {
    console.log("UserChannel subscription closed");
  });
};
setupMyChannelsSub();
