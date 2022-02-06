// content: {
//   plain: "Plain Content",
//   rich: "Rich text<br/>Content"
//   }
/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendAlert(subscription, content) {
  const logger = Moralis.Cloud.getLogger();
  const relChannels = subscription.relation("UserChannel");
  const qc = relChannels.query();
  qc.equalTo("status", "Active");
  const channels = await qc.find({ useMasterKey: true });
  logger.info(`[SendAlert] Sending to ${channels.length} Channels`);
  for (let i = 0; i < channels.length; i++) {
    const chan = channels[i];
    const PID = chan.get("providerID");
    let res = null;
    if (PID == "discord") {
      res = await sendDiscordAlert(chan, content);
    } else if (PID == "twilio") {
      res = await sendTwilioAlert(chan, content);
    } else if (PID == "email") {
      res = await sendEmailAlert(chan, content);
    } else if (PID == "telegram") {
      res = await sendTelegramAlert(chan, content);
    }
    saveAlertHistory(subscription, chan, content, res);
  }
}

async function saveAlertHistory(subscription, uChannel, content, result) {
  const aHist = Moralis.Object.extend("AlertHistory");
  const ah = new aHist();
  ah.set("UserChannel", uChannel);
  const u = uChannel.get("User");
  ah.set("User", u);
  ah.set("Subscription", subscription);
  ah.set("content", content);
  ah.set("result", result);
  await ah.save(null, { useMasterKey: true });
  return true;
}
