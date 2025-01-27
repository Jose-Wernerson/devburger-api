import * as Yup from 'yup'
import Category from '../models/Category'

class CategoryController {
	async store(request, response) {
		try {
			// Schema de validação
			const schema = Yup.object({
				name: Yup.string().required('Nome é obrigatório'),
			})

			// Validação do corpo da requisição
			await schema.validate(request.body, { abortEarly: false })

			// Desestruturação dos dados
			const { name } = request.body

			const categoryExists = await Category.findOne({
				where: {
					name,
				},
			})
			if (categoryExists) {
				return response.status(400).json({ error: 'category already exists' })
			}

			// Criação do produto
			const { id } = await Category.create({
				name,
				// Os campos created_at e updated_at serão preenchidos automaticamente pelo Sequelize
			})

			return response.status(201).json({ id, name })
		} catch (err) {
			// Se for erro de validação do Yup
			if (err instanceof Yup.ValidationError) {
				return response.status(400).json({ errors: err.errors })
			}

			// Para outros tipos de erro
			console.error(err)
			return response.status(500).json({ error: 'Erro interno do servidor' })
		}
	}

	async index(request, response) {
		try {
			const categories = await Category.findAll({
				order: [['created_at', 'DESC']], // Ordenar do mais recente para o mais antigo
			})

			return response.json(categories)
		} catch (err) {
			console.error(err)
			return response.status(500).json({ error: 'Erro interno do servidor' })
		}
	}
}

export default new CategoryController()
