/* eslint-disable no-undef */
Moralis.Cloud.afterSave("Alert", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const query = new Moralis.Query("Subscription");
  logger.info("Requested " + request.object.get("type"));
  const content = request.object.get("content");
  query.equalTo("subscriptionType", "General");
  query.equalTo("generalType", request.object.get("type"));
  const res = await query.find();
  const count = await query.count();
  logger.info(`Got ${res} with ${count}`);
  for (let i = 0; i < res.length; i++) {
    const obj = res[i];
    logger.info(`Sending "${content}" to ${obj.id}`);
    sendAlert(obj, content);
  }
});
