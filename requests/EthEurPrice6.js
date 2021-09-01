import * as Witnet from "witnet-requests"

// Retrieves ETHEUR price of CFX from the Binance API
const binance = new Witnet.Source("https://api.binance.com/api/v3/ticker/price?symbol=ETHEUR")
  .parseJSONMap()
  .getFloat("price")
  .multiply(10 ** 6)
  .round()

// Retrieves ETHEUR price of CFX from the Coinbase API
const coinbase = new Witnet.Source("https://api.coinbase.com/v2/prices/ETH-EUR/spot")
  .parseJSONMap()
  .getMap("data")
  .getFloat("amount")
  .multiply(10 ** 6)
  .round()

// Retrieves ETHEUR price of CFX from the Coinbase API
const kraken = new Witnet.Source("https://api.kraken.com/0/public/Ticker?pair=ETHEUR")
  .parseJSONMap()
  .getMap("result")
  .getMap("XETHZEUR")
  .getArray("a")
  .getFloat(0)
  .multiply(10 ** 6)
  .round()

// Retrieves ETHEUR price of eth from the BitStamp API
const bitstamp = new Witnet.Source("https://www.bitstamp.net/api/v2/ticker/etheur/")
  .parseJSONMap()
  .getFloat("last")
  .multiply(10 ** 6)
  .round()

// Retrieves ETHEUR price of eth from the Bitfinex API
const bitfinex = new Witnet.Source("https://api.bitfinex.com/v1/pubticker/etheur")
  .parseJSONMap()
  .getFloat("last_price")
  .multiply(10 ** 6)
  .round()

// Retrieves ETHEUR price of eth from the Bittrex API
const bittrex = new Witnet.Source("https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-LTC")
  .parseJSONMap()
  .getMap("result")
  .getFloat("Last")
  .multiply(10 ** 6)
  .round()

// Filters out any value that is more than 1.5 times the standard
// deviationaway from the average, then computes the average mean of the
// values that pass the filter.
const aggregator = new Witnet.Aggregator({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 1.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

// Filters out any value that is more than 1.5 times the standard
// deviationaway from the average, then computes the average mean of the
// values that pass the filter.
const tally = new Witnet.Tally({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 1.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

const request = new Witnet.Request()
  .addSource(binance)
  .addSource(coinbase)
  .addSource(kraken)
  .addSource(bitstamp)
  .addSource(bitfinex)
  .addSource(bittrex)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(25) // Set witnesses count
  .setFees(1000000, 1000000) // Set economic incentives (e.g. witness reward: 1 mWit, commit/reveal fee: 1 mWit)
  .setCollateral(10000000000) // Set collateral (e.g. 10 Wit)

// Do not forget to export the request object
export { request as default }
