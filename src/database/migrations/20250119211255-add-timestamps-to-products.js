module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface
			.addColumn('products', 'created_at', {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			})
			.then(() => {
				return queryInterface.addColumn('products', 'updated_at', {
					type: Sequelize.DATE,
					allowNull: false,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				})
			})
	},

	down: async (queryInterface) => {
		return queryInterface.removeColumn('products', 'created_at').then(() => {
			return queryInterface.removeColumn('products', 'updated_at')
		})
	},
}
