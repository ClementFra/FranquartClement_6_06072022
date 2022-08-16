const rateLimit = require('express-rate-limit');

// Add ratelimit to limit the repeated request by user
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
	message: "Login error, you have reached maximum retries. Please try again after 15 minutes",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = rateLimiter;