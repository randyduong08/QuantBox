#[derive(Debug)]
pub enum MarketDataError {
    ApiError(String),
    Forbidden,
    RateLimited,
    InvalidSymbol,
    NetworkError(reqwest::Error),
    ParseError(String),
}

impl From<reqwest::Error> for MarketDataError {
    fn from(err: reqwest::Error) -> Self {
        MarketDataError::NetworkError(err)
    }
}
