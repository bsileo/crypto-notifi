/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
function sendEmailAlert(channel, content) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Email send ${content} to ${channel.get("providerData").email}`);
  const SENDGRID_API_KEY = getAPIKey("SENDGRID_API_KEY");
  const data = {
    personalizations: [
      {
        to: [{ email: channel.get("providerData").email }],
      },
    ],
    from: { email: "brad@sileo.name", name: "Crypto Notifi" },
    subject: "CryptoNotifi Alert",
    content: [{ type: "text/plain", value: content }],
  };
  Moralis.Cloud.httpRequest({
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    body: data,
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  }).then(
    function (httpResp) {
      logger.info(`Email sent - response= (${httpResp.status})-${httpResp.text}`);
    },
    function (httpResp) {
      logger.error(
        "Request failed with response code " +
          httpResp.status +
          "::" +
          httpResp.text
      );
    }
  );
}
