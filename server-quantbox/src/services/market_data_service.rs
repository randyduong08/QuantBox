use crate::models::market_data_models::{
    MarketDataError, MarketDataProvider, OptionsContract, StockQuote, VolatilityPoint,
    VolatilitySurface,
};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

pub struct MarketDataService {
    pub provider: Box<dyn MarketDataProvider + Send + Sync>,
    cache: HashMap<String, (StockQuote, DateTime<Utc>)>,
    cache_ttl_seconds: i64,
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

    pub async fn build_volatility_surface(
        &mut self,
        symbol: &str,
    ) -> Result<VolatilitySurface, MarketDataError> {
        let quote: StockQuote = self.get_quote_cached(symbol).await?;
        let options: Vec<OptionsContract> = self.provider.get_options_chain(symbol, None).await?;

        println!("QUOTE: {:?}", quote);
        // println!("OPTIONS: {:?}", options);
        println!("OPTIONS LENGTH: {}", options.len());

        // TODO -- FIX, OPTIONS VAR WE'RE INITIALIZING HAS LIKE NOTHING FOR THE FIELDS, MAINLY IMPLIED VOLATILITY
        // TODO -- LOOKS LIKE WE GOTTA FIX THE FIELD MATCHING FOR THE GET_OPTIONS_CHAIN FUNC IN MARKET_DATA_PROVIDER.RS...

        let mut points = Vec::new();
        for option in options {
            if let Some(iv) = option.implied_volatility {
                let days_to_expiry: i64 =
                    (option.expiration_date - Utc::now().date_naive()).num_days();
                println!("DAYS TO EXPIRY: {}", days_to_expiry);
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
