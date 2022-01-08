/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
//
// URL to run this:
//  https://dfnrl9oy6cjp.usemoralis.com:2053/server/functions/databaseSetup?_ApplicationId=vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW
//
// Safe to run on an existing database to update/reset it to the starting state for all configurations
//
//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Moralis.Cloud.define("databaseSetup", async (request) => {
  // PROTOCOL
  const protocol = Moralis.Object.extend("Protocol");
  const query = new Moralis.Query(protocol);
  query.equalTo("name", "Snowball");
  let results = await query.find();
  if (results.length > 0) {
    p = results[0];
  } else {
    p = new protocol();
  }
  p.set("name", "Snowball");
  p.set("website", "https://app.snowball.network/");
  p.set(
    "iconURL",
    "https://app.snowball.network/_next/image?url=%2Fassets%2Fimages%2Flogo-dark-label.svg&w=640&q=75"
  );
  p.set("tokenData", {
    symbol: "xSNOB",
    contractAddress: "0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E",
    chain: "Avalanche",
    basicQuantity: 100,
    goldQuantity: 1000,
  });
  p.set("chains", ["avalanche"]);
  p.save();
  // Axial
  query.equalTo("name", "Axial");
  results = await query.find();
  if (results.length > 0) {
    p = results[0];
  } else {
    p = new protocol();
  }
  p.set("name", "Axial");
  p.set("website", "https://www.axial.exchange/");
  p.set("iconURL", "https://app.axial.exchange/static/media/logo.6a08160b.svg");
  p.set("chains", ["avalanche"]);
  p.set("tokenData", {
    symbol: "AXIAL",
    contractAddress: "0xcF8419A615c57511807236751c0AF38Db4ba3351",
    chain: "Avalanche",
    basicQuantity: 2500,
    goldQuantity: 10000,
  });
  p.save();

  return true;
});
