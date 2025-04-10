import Stripe from 'stripe'
import * as Yup from 'yup'
import 'dotenv/config'

const stripe = require('stripe')(
	'sk_test_51R8Sa9RehNutrk7WnT9gtoW8D1bRqeiQEIggqh7KSDZhdbF7qJnOLTZ8ICzIohNKYgLqrXAlIZRBtEvkTBy3MTts00GboxikbU',
)
const calculateOrderAmount = (items) => {
	const total = items.reduce((acc, current) => {
		return current.price * current.quantity + acc
	}, 0)

	return total
}
class CreatPaymentIntentController {
	async store(request, response) {
		const schema = Yup.object({
			products: Yup.array()
				.required()
				.of(
					Yup.object({
						id: Yup.number().required(),
						quantity: Yup.number().required(),
						price: Yup.number().required(),
					}),
				),
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ errors: err.errors })
		}

		const { products } = request.body

		const amount = calculateOrderAmount(products)

		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: 'brl',
			automatic_payment_methods: {
				enabled: true,
			},
		})
		response.json({
			clientSecret: paymentIntent.client_secret,
			dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
		})
	}
}

export default new CreatPaymentIntentController()
