import * as Yup from 'yup'
import Product from '../models/Product'

class ProductController {
	async store(request, response) {
		try {
			// Schema de validação
			const schema = Yup.object({
				name: Yup.string().required('Nome é obrigatório'),
				price: Yup.number().required('Preço é obrigatório'),
				category: Yup.string().required('Categoria é obrigatória'),
			})

			// Validação do corpo da requisição
			await schema.validate(request.body, { abortEarly: false })

			// Verifica se existe arquivo
			if (!request.file) {
				return response.status(400).json({ error: 'Imagem é obrigatória' })
			}

			// Desestruturação dos dados
			const { filename: path } = request.file
			const { name, price, category } = request.body

			// Criação do produto
			const product = await Product.create({
				name,
				price,
				category,
				path,
				// Os campos created_at e updated_at serão preenchidos automaticamente pelo Sequelize
			})

			return response.status(201).json(product)
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
			const products = await Product.findAll({
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
