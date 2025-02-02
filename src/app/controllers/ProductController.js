import * as Yup from 'yup'
import Category from '../models/Category'
import Product from '../models/Product'
import User from '../models/User'

class ProductController {
	async store(request, response) {
		// Schema de validação
		const schema = Yup.object({
			name: Yup.string().required('Nome é obrigatório'),
			price: Yup.number().required('Preço é obrigatório'),
			category_id: Yup.number().required('Categoria é obrigatória'),
			offer: Yup.boolean(),
		})

		try {
			schema.validate(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { admin: isAdmin } = await User.findByPk(request.userId)
		if (!isAdmin) {
			return response.status(401).json()
		}

		// Verifica se existe arquivo
		if (!request.file) {
			return response.status(400).json({ error: 'Imagem é obrigatória' })
		}

		// Desestruturação dos dados
		const { filename: path } = request.file
		const { name, price, category_id, offer } = request.body

		// Criação do produto
		const product = await Product.create({
			name,
			price,
			category_id,
			path,
			offer,
			// Os campos created_at e updated_at serão preenchidos automaticamente pelo Sequelize
		})

		return response.status(201).json(product)
	}

	async update(request, response) {
		// Schema de validação
		const schema = Yup.object({
			name: Yup.string(),
			price: Yup.number(),
			category_id: Yup.number(),
			offer: Yup.boolean(),
		})

		try {
			schema.validate(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { admin: isAdmin } = await User.findByPk(request.userId)
		if (!isAdmin) {
			return response.status(401).json()
		}

		const { id } = request.params

		const findProduct = await Product.findByPk(id)

		if (!findProduct) {
			return response
				.status(400)
				.json({ error: 'Make sure your product ID is correct' })
		}

		let path
		if (request.file) {
			path = request.file.filename
		}

		// Desestruturação dos dados

		const { name, price, category_id, offer } = request.body

		// Criação do produto
		await Product.update(
			{
				name,
				price,
				category_id,
				path,
				offer,
				// Os campos created_at e updated_at serão preenchidos automaticamente pelo Sequelize
			},
			{
				where: {
					id,
				},
			},
		)

		return response.status(200).json()
	}

	async index(request, response) {
		try {
			const products = await Product.findAll({
				include: [
					{
						model: Category,
						as: 'category',
						attributes: ['id', 'name'],
					},
				],
				order: [['created_at', 'DESC']], // Ordenar do mais recente para o mais antigo
			})

			return response.json(products)
		} catch (err) {
			console.error(err)
			return response.status(500).json({ error: 'Erro interno do servidor' })
		}
	}
}

export default new ProductController()
