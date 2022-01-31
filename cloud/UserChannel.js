/* eslint-disable no-undef */
Moralis.Cloud.beforeDelete("UserChannel", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: uc, context } = request;
  const subs = uc.relation("subscriptions");
  const q = subs.query();
  const count = await q.count({ useMasterKey: true });
  if (count > 0) {
    throw "Can't delete a Channel if it still has subscriptions.";
  }
});
