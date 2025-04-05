import * as Yup from 'yup'
import Category from '../models/Category'
import Product from '../models/Product'
import User from '../models/User'
import Order from '../schemas/Order'

class OrderController {
	// Função para criar um pedido
	async store(request, response) {
		// Validação com Yup
		const schema = Yup.object().shape({
			products: Yup.array()
				.required()
				.of(
					Yup.object().shape({
						id: Yup.number().required(),
						quantity: Yup.number().required(),
					}),
				),
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ errors: err.errors })
		}

		const { products } = request.body

		const productsIds = products.map((product) => product.id)

		// Busca os produtos no banco de dados
		const findProducts = await Product.findAll({
			where: { id: productsIds },
			include: [
				{
					model: Category,
					as: 'category',
					attributes: ['name'],
				},
			],
		})

		// Formata os produtos
		const formattedProducts = findProducts.map((product) => {
			const productIndex = products.findIndex((item) => item.id === product.id)
			return {
				id: product.id,
				name: product.name,
				category: product.category.name,
				price: product.price,
				url: product.url,
				quantity: products[productIndex].quantity,
			}
		})

		// Cria o pedido
		const order = {
			user: {
				id: request.userId,
				name: request.userName,
			},
			products: formattedProducts,
			status: 'pedido realizado',
		}

		const createdOrder = await Order.create(order)

		// Retorna o pedido criado com verificação da data
		return response.status(201).json({
			user: createdOrder.user,
			products: formattedProducts,
			status: createdOrder.status,
			created_at: createdOrder.created_at
				? new Date(createdOrder.created_at).toISOString()
				: null, // Verifica validade
		})
	}

	// Função para listar pedidos
	async index(request, response) {
		const orders = await Order.find()

		// Formata os pedidos com verificação da data
		const formattedOrders = orders.map((order) => {
			let formattedDate = null
			if (order.created_at) {
				try {
					formattedDate = new Date(order.created_at).toISOString() // Tenta formatar a data
				} catch (error) {
					console.error(
						`Erro ao formatar a data do pedido ${order._id}:`,
						error.message,
					)
				}
			}
			return {
				...order.toObject(),
				created_at: formattedDate, // Define `null` caso a data seja inválida
			}
		})

		return response.json(formattedOrders)
	}

	// Função para atualizar o status de um pedido
	async update(request, response) {
		const schema = Yup.object().shape({
			status: Yup.string().required(),
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ errors: err.errors })
		}

		const { admin: isAdmin } = await User.findByPk(request.userId)
		if (!isAdmin) {
			return response.status(401).json({ error: 'Usuário não autorizado' })
		}

		const { id } = request.params
		const { status } = request.body

		try {
			await Order.updateOne({ _id: id }, { status })
		} catch (err) {
			return response.status(400).json({ error: err.message })
		}

		return response.json({ message: 'Status atualizado com sucesso' })
	}
}

export default new OrderController()
