/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
Moralis.Cloud.beforeSave(
  "UserChannel",
  async (request) => {
    return true;
  },
  {
    fields: {
      userID: {
        required: true,
        error: "You must provide a UserID",
      },
      providerID: {
        required: true,
      },
      name: {
        required: true,
      },
    },
  }
);

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
