use crate::market_integration::polygon_provider::PolygonProvider;
use crate::models::black_scholes_models::OptionType;
use crate::models::market_data_models::{HistoricalBar, HistoricalResponse, StockQuote};
use crate::models::market_data_models::{MarketDataError, OptionsContract};
use crate::models::polygon_models::{PolygonOptionsResponse, PolygonQuoteResponse};
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

        match response.results {
            Some(quote) => {
                Ok(StockQuote {
                    symbol: symbol.to_string(),
                    price: quote.close.unwrap_or(0.0),
                    bid: None, // prev day data doesn't include bid/ask
                    ask: None,
                    volume: quote.volume.map(|v| v as i64).unwrap_or(0),
                    timestamp: Utc::now(),
                })
            }
            None => Err(MarketDataError::InvalidSymbol),
        }
    }

    async fn get_options_chain(
        &self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError> {
        let endpoint: &str = "/v3/reference/options/contracts";
        let mut params: Vec<(&str, String)> = vec![
            ("underlying_ticker", symbol.to_string()),
            ("limit", "1000".to_string()),
        ];

        if let Some(exp_date) = expiry {
            params.push(("expiration_date", exp_date.format("%Y-%m-%d").to_string()));
        }

        let response: PolygonOptionsResponse = self.make_request(endpoint, &params).await?;

        match response.results {
            Some(options) => {
                let mut contracts = Vec::new();
                for opt in options {
                    let option_type = match opt.contract_type.as_str() {
                        "call" => OptionType::Call,
                        "put" => OptionType::Put,
                        _ => continue,
                    };

                    let expiration_date =
                        NaiveDate::parse_from_str(&opt.expiration_date, "%Y-%m-%d")
                            .map_err(|e| MarketDataError::ParseError(e.to_string()))?;

                    contracts.push(OptionsContract {
                        symbol: opt.symbol,
                        underlying_symbol: opt.underlying_symbol,
                        strike_price: opt.strike_price,
                        expiration_date,
                        option_type,
                        bid: opt.last_quote.as_ref().and_then(|q| q.bid),
                        ask: opt.last_quote.as_ref().and_then(|q| q.ask),
                        last_price: opt.last_quote.as_ref().and_then(|q| q.last),
                        volume: None,
                        open_interest: None,
                        implied_volatility: opt.implied_volatility,
                        delta: opt.delta,
                        gamma: opt.gamma,
                        theta: opt.theta,
                        vega: opt.vega,
                        updated_at: Utc::now(),
                    });
                }
                Ok(contracts)
            }
            None => Ok(Vec::new()),
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
            to.format("%H:%M:%S")
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
