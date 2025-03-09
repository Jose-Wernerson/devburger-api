require('dotenv').config()
module.exports = {
	dialect: 'postgresql',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'postgres',
	database: 'devburger',
	define: {
		timestamps: true,
		underscored: true,
		underscoredAll: true,
	},
	// #Stripe
	stripe_secret_key: process.env.STRIPE_SECRET_KEY,
}
