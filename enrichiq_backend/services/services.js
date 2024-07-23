import Stripe from "stripe";
import dotenv from "dotenv";
import { Log } from "../supabase.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2024-06-20",
})

const client_endpoint =
	process.env.NODE_ENV !== "production"
		? "http://localhost:5173"
		: "https://dev-enrichiq.vercel.app"


/*
Functions to perform stripe services and functionalities
*/

export async function getAllActiveProducts() {
  try {
    return await stripe.products.list({
      active: true,
    });
  } catch (error) {
    console.log(error.message);
    throw [];
  }
}

export async function getAllRecurringPrices(product_id) {
  try {
    const monthlyPrices = await stripe.prices.list({
      ...(product_id && { product: product_id }),
      recurring: { interval: "month" },
    });

    // Retrieve yearly prices
    const yearlyPrices = await stripe.prices.list({
      ...(product_id && { product: product_id }),
      recurring: { interval: "year" },
    });

    return { monthlyPrices, yearlyPrices };
  } catch (error) {
    console.log(error.message);
    throw [];
  }
}
  
export async function cancelStripeSubscriptionAtPeriodEnd(subscription_id) {
  try {
    return await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export async function checkoutSession({ price_id, email }) {
  try {
    let customer;
    const customers = await stripe.customers.list({ email });

    if (customers.data.length > 0) {
      customer = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email });
      customer = newCustomer.id;
    }
    
    await Log(customer, "Checkout session initialized successfully!")
    return await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [{ price: price_id, quantity: 1 }],
			mode: "subscription",
			success_url: `${client_endpoint}/settings`,
			cancel_url: `${client_endpoint}`,
			customer_email: email,
		})
  } catch (err) {
    console.error(`Subscription creation failed: ${err.message}`);
    throw new Error('Failed to create checkout session');
  }
}

export async function getSubscription(email) {
  try {
    const customers = await stripe.customers.list({ email });
    if (customers.data.length === 0) {
      return null;
    }

    const customer = customers.data[0];
    const subscriptions = await stripe.subscriptions.list({
			customer: customer.id,
		})

    if (subscriptions.data.length === 0) {
      return null;
    }

    const subscription = subscriptions.data.find(subscription => subscription.status !== "canceled");

    return subscription
			? {
					subscription_id: subscription.id,
					status: subscription.status,
					current_period_end: subscription.current_period_end,
					schedule: subscription.schedule,
					cancel_at: subscription.cancel_at,
					customer: subscription.customer
			  }
			: null

  } catch (error) {
    console.error('Error getting subscription:', error.message);
    throw new Error('Failed to retrieve subscription');
  }
}

export async function getStripeProduct(product_id) {
    try {
      return await stripe.products.retrieve(product_id);
    } catch (error) {
      console.error('Error getting product:', error.message);
      throw error;
    }
  }

export async function getStripeSubscription(subscription_id) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    return subscription;
  } catch (error) {
    console.error('Error getting subscription:', error.message);
    throw error;
  }
}

export async function constructEvent(payload, signature) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WH_SECRET_KEY
    );
  } catch (error) {
    console.log(error.message);
    return null;
  }
}


export async function scheduleSubscriptionDowngrade(
	subscriptionId,
	newPriceId
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
	try {
		const currentPeriodEnd = subscription.current_period_end
		const currentPeriodStart = subscription.current_period_start

		let subscriptionSchedule
		if (subscription.schedule) {
			subscriptionSchedule = await stripe.subscriptionSchedules.retrieve(
				subscription.schedule
			)

			if (subscriptionSchedule.status === "canceled") {
				subscriptionSchedule = await stripe.subscriptionSchedules.create({
					from_subscription: subscriptionId,
				})
			}
		} else {
			subscriptionSchedule = await stripe.subscriptionSchedules.create({
				from_subscription: subscriptionId,
			})
		}

		const updatedSchedule = await stripe.subscriptionSchedules.update(
			subscriptionSchedule.id,
			{
				end_behavior: "release",
				phases: [
					{
						start_date: currentPeriodStart,
						end_date: currentPeriodEnd,
						items: [{ price: subscription.items.data[0].price.id }],
					},
					{
						start_date: currentPeriodEnd,
						items: [{ price: newPriceId }],
					},
				],
			}
		)

		console.log("Subscription schedule created:")

		await Log(
			subscription.customer,
			`Subscription schedule created: ${updatedSchedule.id}`
		)
		return updatedSchedule
	} catch (error) {
		console.error("Error creating subscription schedule:", error.message)

		if (subscription && subscription.customer) {
			await Log(
				subscription.customer,
				`Error in scheduling subscription downgrade: ${error.message}`
			)
		}

		throw new Error(error.message)
	}
}
//   f 

export async function cancelSubscriptionSchedule(scheduleId) {
  var cancelScheduled = ""
  
  try {
    const canceledSchedule = await stripe.subscriptionSchedules.release(
      scheduleId
    );
    cancelScheduled = canceledSchedule
    await Log(
			canceledSchedule.customer,
			`Subscription Schedule ${canceledSchedule.id} is released`
		)
    console.log("Subscription schedule canceled:", canceledSchedule);
    return canceledSchedule;
  } catch (error) {
    throw new Error(error);
  }
}

export async function upgradeSubscription(subscriptionId, newPlanId) {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId)
	try {
		const updatedSubscription = await stripe.subscriptions.update(
			subscriptionId,
			{
				items: [
					{
						id: subscription.items.data[0].id,
						plan: newPlanId,
					},
				],
				proration_behavior: "create_prorations",
			}
		)

		const invoice = await stripe.invoices.create({
			customer: subscription.customer,
			subscription: subscriptionId,
			auto_advance: false, 
		})

		const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

		const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id)

		await Log(
			subscription.customer,
			`Subscription upgraded to price Id: ${newPlanId}`
		)

		return {
			subscription: updatedSubscription,
			invoice: paidInvoice,
		}
	} catch (error) {
		await Log(subscription.customer, `Error, failed to upgrade plan: ${error}`)

		return {
			error: error.message,
		}
	}
}

export const changeStripeEmail = async (req, res) => {
  const {customerId, newEmail} = req.body

	try {
		const customer = await stripe.customers.update(customerId, {
			email: newEmail,
		})

		console.log("Customer email updated successfully:", customer)
    await Log(
      customerId,
      `Email is changed to ${newEmail} by ${customerId}`
    )
		res.status(200).json({
      success: true
    })
	} catch (error) {
		console.error("Error updating customer email:", error)
     await Log(customerId, `Error updating customer email:", ${error}`)
		res.status(500).json({
      success: false
    })
	}
}