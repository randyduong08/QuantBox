use crate::market_integration::polygon_provider::PolygonProvider;
use crate::models::black_scholes_models::OptionType;
use crate::models::market_data_models::{HistoricalBar, HistoricalResponse, StockQuote};
use crate::models::market_data_models::{MarketDataError, OptionsContract};
use crate::models::polygon_models::{
    PolygonOption, PolygonOptionSnapshot, PolygonOptionSnapshotResponse, PolygonOptionsResponse,
    PolygonQuoteResponse,
};
use async_trait::async_trait;
use chrono::{DateTime, NaiveDate, Utc};

#[async_trait]
pub trait MarketDataProvider {
    async fn get_quote(&self, symbol: &str) -> Result<StockQuote, MarketDataError>;
    async fn get_options_chain(
        &self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError>;
    async fn get_historical_data(
        &self,
        symbol: &str,
        from: NaiveDate,
        to: NaiveDate,
    ) -> Result<Vec<HistoricalBar>, MarketDataError>;
}

#[async_trait]
impl MarketDataProvider for PolygonProvider {
    async fn get_quote(&self, symbol: &str) -> Result<StockQuote, MarketDataError> {
        let endpoint: String = format!("/v2/aggs/ticker/{}/prev", symbol);
        let response: PolygonQuoteResponse = self.make_request(&endpoint, &[]).await?;
        if let Some(quote) = response.results.first() {
            Ok(StockQuote {
                symbol: symbol.to_string(),
                price: quote.close,
                bid: None,
                ask: None,
                volume: quote.volume as i64,
                timestamp: Utc::now(),
            })
        } else {
            Err(MarketDataError::InvalidSymbol)
        }
    }

    async fn get_options_chain(
        &self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError> {
        match self.get_options_chain_snapshot(symbol, expiry).await {
            Err(MarketDataError::Forbidden) => {
                self.get_reference_options_contracts(symbol, expiry).await
            }
            result => result,
        }
    }

    async fn get_historical_data(
        &self,
        symbol: &str,
        from: NaiveDate,
        to: NaiveDate,
    ) -> Result<Vec<HistoricalBar>, MarketDataError> {
        let endpoint: String = format!(
            "/v2/aggs/ticker/{}/range/1/day/{}/{}",
            symbol,
            from.format("%Y-%m-%d"),
            to.format("%Y-%m-%d")
        );

        let response: HistoricalResponse = self.make_request(&endpoint, &[]).await?;

        match response.results {
            Some(bars) => Ok(bars
                .into_iter()
                .map(|bar| HistoricalBar {
                    symbol: symbol.to_string(),
                    timestamp: DateTime::from_timestamp(bar.timestamp / 1000, 0)
                        .unwrap_or(Utc::now()),
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                    volume: bar.volume as i64,
                })
                .collect()),
            None => Ok(Vec::new()),
        }
    }
}

impl PolygonProvider {
    async fn get_options_chain_snapshot(
        &self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError> {
        let endpoint: String = format!("/v3/snapshot/options/{}", symbol);
        let mut params: Vec<(&str, String)> = vec![("limit", "250".to_string())];

        if let Some(exp_date) = expiry {
            params.push(("expiration_date", exp_date.format("%Y-%m-%d").to_string()));
        }

        let mut response: PolygonOptionSnapshotResponse =
            self.make_request(&endpoint, &params).await?;
        let mut snapshots: Vec<PolygonOptionSnapshot> = response.results.take().unwrap_or_default();

        while let Some(next_url) = response.next_url.take() {
            response = self.make_request_url(&next_url, &[]).await?;
            snapshots.extend(response.results.take().unwrap_or_default());
        }

        snapshots
            .into_iter()
            .filter_map(|snapshot| map_option_snapshot(symbol, snapshot))
            .collect()
    }

    async fn get_reference_options_contracts(
        &self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError> {
        let endpoint = "/v3/reference/options/contracts";
        let mut params: Vec<(&str, String)> = vec![
            ("underlying_ticker", symbol.to_string()),
            ("limit", "1000".to_string()),
        ];

        if let Some(exp_date) = expiry {
            params.push(("expiration_date", exp_date.format("%Y-%m-%d").to_string()));
        }

        let response: PolygonOptionsResponse = self.make_request(endpoint, &params).await?;

        response
            .results
            .unwrap_or_default()
            .into_iter()
            .filter_map(map_reference_option)
            .collect()
    }
}

fn map_reference_option(option: PolygonOption) -> Option<Result<OptionsContract, MarketDataError>> {
    let option_type = match option.contract_type.as_str() {
        "call" => OptionType::Call,
        "put" => OptionType::Put,
        _ => return None,
    };

    let expiration_date = match NaiveDate::parse_from_str(&option.expiration_date, "%Y-%m-%d") {
        Ok(date) => date,
        Err(e) => return Some(Err(MarketDataError::ParseError(e.to_string()))),
    };

    Some(Ok(OptionsContract {
        symbol: option.symbol,
        underlying_symbol: option.underlying_symbol,
        strike_price: option.strike_price,
        expiration_date,
        option_type,
        bid: None,
        ask: None,
        last_price: None,
        volume: None,
        open_interest: None,
        implied_volatility: None,
        delta: None,
        gamma: None,
        theta: None,
        vega: None,
        updated_at: Utc::now(),
    }))
}

pub(crate) fn map_option_snapshot(
    symbol: &str,
    snapshot: PolygonOptionSnapshot,
) -> Option<Result<OptionsContract, MarketDataError>> {
    let option_type = match snapshot.details.contract_type.as_str() {
        "call" => OptionType::Call,
        "put" => OptionType::Put,
        _ => return None,
    };

    let expiration_date =
        match NaiveDate::parse_from_str(&snapshot.details.expiration_date, "%Y-%m-%d") {
            Ok(date) => date,
            Err(e) => return Some(Err(MarketDataError::ParseError(e.to_string()))),
        };

    let underlying_symbol = snapshot
        .underlying_asset
        .as_ref()
        .and_then(|asset| asset.ticker.clone())
        .unwrap_or_else(|| symbol.to_string());

    Some(Ok(OptionsContract {
        symbol: snapshot.details.ticker,
        underlying_symbol,
        strike_price: snapshot.details.strike_price,
        expiration_date,
        option_type,
        bid: snapshot.last_quote.as_ref().and_then(|q| q.bid),
        ask: snapshot.last_quote.as_ref().and_then(|q| q.ask),
        last_price: snapshot.last_trade.as_ref().and_then(|t| t.price),
        volume: snapshot
            .day
            .as_ref()
            .and_then(|day| day.volume.map(|volume| volume as i64)),
        open_interest: snapshot.open_interest,
        implied_volatility: snapshot.implied_volatility,
        delta: snapshot.greeks.as_ref().and_then(|g| g.delta),
        gamma: snapshot.greeks.as_ref().and_then(|g| g.gamma),
        theta: snapshot.greeks.as_ref().and_then(|g| g.theta),
        vega: snapshot.greeks.as_ref().and_then(|g| g.vega),
        updated_at: Utc::now(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::black_scholes_models::OptionType;

    #[test]
    fn maps_polygon_snapshot_to_options_contract() {
        let json = r#"
        {
          "status": "OK",
          "results": [
            {
              "day": { "volume": 868 },
              "details": {
                "contract_type": "call",
                "expiration_date": "2027-01-15",
                "strike_price": 150,
                "ticker": "O:AAPL270115C00150000"
              },
              "greeks": {
                "delta": 0.62,
                "gamma": 0.04,
                "theta": -0.02,
                "vega": 0.15
              },
              "implied_volatility": 0.31,
              "last_quote": {
                "ask": 12.4,
                "bid": 12.1
              },
              "last_trade": {
                "price": 12.25
              },
              "open_interest": 1543,
              "underlying_asset": {
                "price": 147,
                "ticker": "AAPL"
              }
            }
          ]
        }
        "#;

        let response: PolygonOptionSnapshotResponse = serde_json::from_str(json).unwrap();
        let snapshot = response.results.unwrap().into_iter().next().unwrap();
        let contract = map_option_snapshot("AAPL", snapshot).unwrap().unwrap();

        assert_eq!(contract.symbol, "O:AAPL270115C00150000");
        assert_eq!(contract.underlying_symbol, "AAPL");
        assert_eq!(contract.option_type, OptionType::Call);
        assert_eq!(contract.strike_price, 150.0);
        assert_eq!(contract.bid, Some(12.1));
        assert_eq!(contract.ask, Some(12.4));
        assert_eq!(contract.last_price, Some(12.25));
        assert_eq!(contract.volume, Some(868));
        assert_eq!(contract.open_interest, Some(1543));
        assert_eq!(contract.implied_volatility, Some(0.31));
        assert_eq!(contract.delta, Some(0.62));
        assert_eq!(contract.gamma, Some(0.04));
        assert_eq!(contract.theta, Some(-0.02));
        assert_eq!(contract.vega, Some(0.15));
    }

    #[test]
    fn maps_snapshot_with_missing_market_fields() {
        let json = r#"
        {
          "status": "OK",
          "results": [
            {
              "details": {
                "contract_type": "put",
                "expiration_date": "2027-01-15",
                "strike_price": 140,
                "ticker": "O:AAPL270115P00140000"
              }
            }
          ]
        }
        "#;

        let response: PolygonOptionSnapshotResponse = serde_json::from_str(json).unwrap();
        let snapshot = response.results.unwrap().into_iter().next().unwrap();
        let contract = map_option_snapshot("AAPL", snapshot).unwrap().unwrap();

        assert_eq!(contract.option_type, OptionType::Put);
        assert_eq!(contract.bid, None);
        assert_eq!(contract.ask, None);
        assert_eq!(contract.implied_volatility, None);
        assert_eq!(contract.delta, None);
    }
}
