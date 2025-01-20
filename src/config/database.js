module.exports = {
	dialect: 'postgresql',
	host: 'localhost',
	port: 5433,
	username: 'postgres',
	password: 'postgres',
	database: 'devburger',
	define: {
		timestamps: true,
		underscored: true,
		underscoredAll: true,
	},
}
