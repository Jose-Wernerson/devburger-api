import Sequelize, { Model } from 'sequelize'

class Category extends Model {
	static init(sequelize) {
		super.init(
			{
				name: Sequelize.STRING,
			},
			{
				sequelize,
				// Isso faz o Sequelize usar created_at e updated_at
			},
		)

		return this
	}
}

export default Category
