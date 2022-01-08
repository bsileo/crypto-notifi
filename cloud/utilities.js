/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAPIKey(name) {
  // const logger = Moralis.Cloud.getLogger();
  const query = new Moralis.Query("API_Keys");
  query.equalTo("keyName", name);
  const res = await query.find();
  for (let i = 0; i < res.length; i++) {
    return res[i];
  }
}
