use crate::models::market_data_models::{
    HistoricalBar, MarketDataError, MarketDataProvider, OptionsContract, StockQuote,
    VolatilityPoint, VolatilitySurface,
};
use chrono::{DateTime, NaiveDate, Utc};
use std::collections::HashMap;

pub struct MarketDataService {
    pub provider: Box<dyn MarketDataProvider + Send + Sync>,
    cache: HashMap<String, (StockQuote, DateTime<Utc>)>,
    cache_ttl_seconds: i64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::black_scholes_models::OptionType;
    use async_trait::async_trait;

    struct FakeProvider;

    #[async_trait]
    impl MarketDataProvider for FakeProvider {
        async fn get_quote(&self, symbol: &str) -> Result<StockQuote, MarketDataError> {
            Ok(StockQuote {
                symbol: symbol.to_string(),
                price: 100.0,
                bid: Some(99.95),
                ask: Some(100.05),
                volume: 1_000_000,
                timestamp: Utc::now(),
            })
        }

        async fn get_options_chain(
            &self,
            symbol: &str,
            _expiry: Option<NaiveDate>,
        ) -> Result<Vec<OptionsContract>, MarketDataError> {
            let future_expiry = Utc::now().date_naive() + chrono::Duration::days(45);
            let expired = Utc::now().date_naive() - chrono::Duration::days(1);

            Ok(vec![
                OptionsContract {
                    symbol: format!("O:{}TESTC00100000", symbol),
                    underlying_symbol: symbol.to_string(),
                    strike_price: 100.0,
                    expiration_date: future_expiry,
                    option_type: OptionType::Call,
                    bid: Some(4.9),
                    ask: Some(5.1),
                    last_price: Some(5.0),
                    volume: Some(100),
                    open_interest: Some(200),
                    implied_volatility: Some(0.25),
                    delta: Some(0.5),
                    gamma: Some(0.03),
                    theta: Some(-0.01),
                    vega: Some(0.2),
                    updated_at: Utc::now(),
                },
                OptionsContract {
                    symbol: format!("O:{}TESTP00090000", symbol),
                    underlying_symbol: symbol.to_string(),
                    strike_price: 90.0,
                    expiration_date: future_expiry,
                    option_type: OptionType::Put,
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
                },
                OptionsContract {
                    symbol: format!("O:{}EXPIREDC00110000", symbol),
                    underlying_symbol: symbol.to_string(),
                    strike_price: 110.0,
                    expiration_date: expired,
                    option_type: OptionType::Call,
                    bid: None,
                    ask: None,
                    last_price: None,
                    volume: None,
                    open_interest: None,
                    implied_volatility: Some(0.4),
                    delta: None,
                    gamma: None,
                    theta: None,
                    vega: None,
                    updated_at: Utc::now(),
                },
            ])
        }

        async fn get_historical_data(
            &self,
            _symbol: &str,
            _from: NaiveDate,
            _to: NaiveDate,
        ) -> Result<Vec<HistoricalBar>, MarketDataError> {
            Ok(Vec::new())
        }
    }

    #[tokio::test]
    async fn builds_volatility_surface_from_non_expired_iv_points() {
        let mut service = MarketDataService::new(Box::new(FakeProvider));

        let surface = service.build_volatility_surface("AAPL").await.unwrap();

        assert_eq!(surface.underlying_symbol, "AAPL");
        assert_eq!(surface.spot_price, 100.0);
        assert_eq!(surface.points.len(), 1);
        assert_eq!(surface.points[0].strike, 100.0);
        assert_eq!(surface.points[0].implied_volatility, 0.25);
        assert_eq!(surface.points[0].option_type, OptionType::Call);
    }
}

impl MarketDataService {
    pub fn new(provider: Box<dyn MarketDataProvider + Send + Sync>) -> Self {
        Self {
            provider,
            cache: HashMap::new(),
            cache_ttl_seconds: 300,
        }
    }

    pub async fn get_quote_cached(&mut self, symbol: &str) -> Result<StockQuote, MarketDataError> {
        let cache_key: String = symbol.to_string();
        let now = Utc::now();

        // check cache
        if let Some((quote, cached_at)) = self.cache.get(&cache_key) {
            if (now - *cached_at).num_seconds() < self.cache_ttl_seconds {
                return Ok(quote.clone());
            }
        }

        // fresh
        let quote: StockQuote = self.provider.get_quote(symbol).await?;
        self.cache.insert(cache_key, (quote.clone(), now));
        Ok(quote)
    }

    pub async fn get_options_chain(
        &mut self,
        symbol: &str,
        expiry: Option<NaiveDate>,
    ) -> Result<Vec<OptionsContract>, MarketDataError> {
        self.provider.get_options_chain(symbol, expiry).await
    }

    pub async fn get_historical_data(
        &self,
        symbol: &str,
        from: NaiveDate,
        to: NaiveDate,
    ) -> Result<Vec<HistoricalBar>, MarketDataError> {
        self.provider.get_historical_data(symbol, from, to).await
    }

    pub async fn build_volatility_surface(
        &mut self,
        symbol: &str,
    ) -> Result<VolatilitySurface, MarketDataError> {
        let quote: StockQuote = self.get_quote_cached(symbol).await?;
        let options: Vec<OptionsContract> = self.get_options_chain(symbol, None).await?;

        let mut points = Vec::new();
        for option in options {
            if let Some(iv) = option.implied_volatility {
                let days_to_expiry: i64 =
                    (option.expiration_date - Utc::now().date_naive()).num_days();
                if days_to_expiry > 0 {
                    points.push(VolatilityPoint {
                        strike: option.strike_price,
                        expiry_days: days_to_expiry as i32,
                        implied_volatility: iv,
                        option_type: option.option_type,
                    });
                }
            }
        }

        Ok(VolatilitySurface {
            underlying_symbol: symbol.to_string(),
            spot_price: quote.price,
            risk_free_rate: 0.05, // TODO -- get from FRED API
            dividend_yield: 0.0,  // TODO -- get from corpo data
            surface_date: Utc::now(),
            points,
        })
    }
}
