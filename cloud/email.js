/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
async function sendEmailAlert(channel, content) {
  //const logger = getLogger();
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Email send ${content} to ${channel.get("providerData").email}`);
  const SENDGRID_API_KEY = await getAPIKey("SENDGRID_API_KEY");
  const sendgridContent = [{ type: "text/plain", value: content.plain }];
  if (content.rich) {
    sendgridContent.push({ type: "text/html", value: content.rich });
  }
  const data = {
    personalizations: [
      {
        to: [{ email: channel.get("providerData").email }],
      },
    ],
    from: { email: "no-reply@cryptonotifi.xyz", name: "Crypto Notifi" },
    subject: "CryptoNotifi Alert",
    content: sendgridContent,
  };
  logger.debug(`[SendEmailAlert] Content-Plain="${content.plain}"`);
  logger.debug(`[SendEmailAlert] Content-Rich="${content.rich}"`);
  try {
    const httpResp = await Moralis.Cloud.httpRequest({
      method: "POST",
      url: "https://api.sendgrid.com/v3/mail/send",
      body: data,
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    });
    const result = { status: true, result: httpResp.text };
    return result;
  } catch (httpResp) {
    logger.error("Caught failed Email");
    const msg =
      "[SendEmailAlert] Request failed with response code " +
      httpResp.status +
      "::" +
      httpResp.text;
    logger.error(msg);
    const result = { status: false, error: msg, result: httpResp.text };
    return result;
  }
}
