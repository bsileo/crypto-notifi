/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
async function sendTwilioAlert(channel, content) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Twilio send "${content.plain}" to ${channel.get("providerData").to}`
  );
  const SID = await getAPIKey("TWILIO_SID");
  const auth = await getAPIKey("TWILIO_AUTH");
  let buff = new Buffer(`${SID}:${auth}`);
  let authCode = buff.toString("base64");
  //logger.info(`Twilio authCode ${authCode}`);
  let data = {
    Body: content.plain,
    MessagingServiceSid: "MG9b664aec58995086004ee6def5c8b333",
    To: channel.get("providerData").to,
  };
  try {
    const httpResp = await Moralis.Cloud.httpRequest({
      method: "POST",
      url: "https://api.twilio.com/2010-04-01/Accounts/AC79bd999e06833449505044506b463878/Messages.js",
      body: data,
      headers: {
        Authorization: `BASIC ${authCode}`,
      },
    });
    const result = { status: true, result: httpResp.text };
    return result;
  } catch (httpResp) {
    const msg =
      "[Twilio] Request failed with response code " +
      httpResp.status +
      "::" +
      httpResp.text;
    logger.error(msg);
    const result = { status: false, error: msg, result: httpResp.text };
    return result;
  }
}
