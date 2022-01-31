// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserSubscriptionCount(user) {
  // eslint-disable-next-line no-undef
  const q = new Moralis.Query("Subscription");
  q.equalTo("userID", user.id);
  const res = await q.count({ useMasterKey: true });
  return res;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserSubscriptionLimit(user) {
  const level = await getUserLevel(user);
  if (level == "Free") {
    return 3;
  } else if (level == "Basic") {
    return 10;
  } else if (level == "Gold") {
    return 100;
  }
}

async function getUserLevel(user) {
  const bal = await getUserNotifiBalance(user);
  if (bal < 100) return "Free";
  else if (bal <= 500) return "Basic";
  else if (bal >= 500) return "Gold";
  return "Free";
}

async function getUserNotifiBalance(user) {
  return 500;
}
