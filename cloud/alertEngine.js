/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendAlert(subscription, content) {
  const logger = Moralis.Cloud.getLogger();
  const relChannels = subscription.relation("UserChannel");
  const channels = await relChannels.query().find();
  logger.info(`SendAlert to ${channels.length} Channels`);
  for (let i = 0; i < channels.length; i++) {
    const chan = channels[i];
    const PID = chan.get("providerID");
    if (PID == "discord") {
      sendDiscordAlert(chan, content);
    } else if (PID == "twilio") {
      sendTwilioAlert(chan, content);
    } else if (PID == "email") {
      sendEmailAlert(chan, content);
    }
  }
}
