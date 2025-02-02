import * as Yup from 'yup'
import Category from '../models/Category'
import Product from '../models/Product'
import User from '../models/User'
import Order from '../schemas/Order'

class OrderController {
	async store(request, response) {
		const schema = Yup.object({
			products: Yup.array()
				.required()
				.of(
					Yup.object({
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

		const findProducts = await Product.findAll({
			where: {
				id: productsIds,
			},
			include: [
				{
					model: Category,
					as: 'category',
					attributes: ['name'],
				},
			],
		})

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

		const order = {
			user: {
				id: request.userId,
				name: request.userName,
			},
			products: formattedProducts,
			status: 'pedido realizado',
		}

		const createdOrder = await Order.create(order)

		return response.status(201).json({
			user: {
				id: createdOrder.user.id,
				name: createdOrder.user.name,
			},
			products: formattedProducts,
			status: createdOrder.status,
		})
	}

	async index(request, response) {
		const orders = await Order.find()

		return response.json(orders)
	}

	async update(request, response) {
		const schema = Yup.object({
			status: Yup.string().required(),
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ errors: err.errors })
		}

		const { admin: isAdmin } = await User.findByPk(request.userId)
		if (!isAdmin) {
			return response.status(401).json()
		}

		const { id } = request.params
		const { status } = request.body

		try {
			await Order.updateOne({ _id: id }, { status })
		} catch (err) {
			return response.status(400).json({ error: err.message })
		}

		return response.json({ message: 'Status update sucessfully' })
	}
}

export default new OrderController()
