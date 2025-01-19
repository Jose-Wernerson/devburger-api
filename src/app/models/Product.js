import Sequelize, { Model } from 'sequelize'

class Product extends Model {
	static init(sequelize) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		super.init(
			{
				name: Sequelize.STRING,
				price: Sequelize.INTEGER,
				category: Sequelize.STRING,
				path: Sequelize.STRING,
				url: {
					type: Sequelize.VIRTUAL,
					get() {
						return `http://localhost:3001/product-file/${this.path}`
					},
				},
			},
			{
				sequelize,
				tableName: 'products',
				timestamps: true, // Garante que as colunas createdAt e updatedAt sejam gerenciadas automaticamente
			},
		)
	}
}

export default Product
