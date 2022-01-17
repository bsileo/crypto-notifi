/* eslint-disable no-undef */
Moralis.Cloud.afterSave("Alert", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const query = new Moralis.Query("Subscription");
  logger.info(`[alert.afterSave()] Requested ${request.object.get("type")}`);
  const content = {
    plain: request.object.get("content"),
    rich: request.object.get("richContent"),
  };
  const prot = request.object.get("Protocol");
  if (prot) {
    query.equalTo("protocolID", prot.id);
  }
  query.equalTo("subscriptionType", "Protocol Alerts");
  query.equalTo("generalType", request.object.get("type"));
  const res = await query.find();
  const count = await query.count();
  logger.info(`[alert.afterSave()] Got ${res} with ${count}`);
  for (let i = 0; i < res.length; i++) {
    const obj = res[i];
    logger.info(`[alert.afterSave()] Sending "${content}" to ${obj.id}`);
    sendAlert(obj, content);
  }
});
