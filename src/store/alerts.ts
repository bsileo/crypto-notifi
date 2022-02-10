import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";

import { Alert } from "@/models/Alert";
import Moralis from "@/config/moralis";
import { Protocol } from "@/models/Protocol";

@Module({ dynamic: true, store: store, namespaced: true, name: "Alerts" })
export class AlertsModule extends VuexModule {
  ALERTS: Array<Alert> = [];
  PROTOCOL: Protocol | undefined = undefined;

  get sentAlerts(): Array<Alert> {
    return this.ALERTS;
  }

  @Action
  public async SET_PROTOCOL(protocol: Protocol | undefined): Promise<void> {
    this.context.commit("SetProtocol", protocol);
    const query = new Moralis.Query(Alert);
    if (protocol) {
      query.equalTo("protocol", protocol);
    }
    this.context.commit("ClearAlerts");
    this.context.commit("SetAlerts", await query.find());
  }

  @Action
  public AddAlert(alert: Alert): void {
    this.context.commit("ADD_ALERT", alert);
  }

  @Mutation
  public ADD_ALERT(alert: Alert): void {
    this.ALERTS.push(alert);
  }

  @Mutation
  public SetProtocol(protocol: Protocol): void {
    this.PROTOCOL = protocol;
  }

  @Mutation
  public ClearAlerts(): void {
    this.ALERTS = [];
  }

  @Mutation
  public SetAlerts(alerts: Alert[]): void {
    this.ALERTS = alerts;
  }

 
}

export const alertsModule = getModule(AlertsModule);

const setupAlertsSub = async () => {
  const refresh = (): void => {
    const qr = new Moralis.Query(Alert);
    if (alertsModule.PROTOCOL) {
      qr.equalTo("protocol", alertsModule.PROTOCOL);
    }
    query.find().then((results: Array<Alert>) => {
      console.log("New Alerts objects loaded");
      alertsModule.SetAlerts(results);
    });
  };
  const query = new Moralis.Query(Alert);
  const subscription = await query.subscribe();
  subscription.on("open", () => {
    refresh();
  });
  subscription.on("create", (object: Alert) => {
    //console.log("object created");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: Alert) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: Alert) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: Alert) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: Alert) => {
    // console.log("object deleted");
    refresh();
  });
  subscription.on("close", () => {
    console.log("subscription closed");
  });
};
//setupAlertsSub();
