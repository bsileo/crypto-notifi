/* eslint-disable no-undef */
Moralis.Cloud.afterSave("Alert", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const query = new Moralis.Query("Subscription");
  logger.info(`[alert.afterSave()] Requested ${request.object.get("GeneralType")}`);
  const content = {
    plain: request.object.get("content"),
    rich: request.object.get("richContent"),
  };
  const prot = request.object.get("Protocol");
  if (prot) {
    query.equalTo("protocolID", prot.id);
  }
  query.equalTo("subscriptionType", "Protocol Alerts");
  query.equalTo("GeneralSubType", request.object.get("GeneralType"));
  const res = await query.find({ useMasterKey: true });
  const count = await query.count({ useMasterKey: true });
  logger.info(`[alert.afterSave()] Got ${res} with ${count}`);
  for (let i = 0; i < res.length; i++) {
    const sub = res[i];
    logger.info(`[alert.afterSave()] Sending "${content}" to SubID=${sub.id}`);
    sendAlert(sub, content);
  }
});
