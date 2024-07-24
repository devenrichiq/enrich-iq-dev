import Stripe from "stripe";
import axios from "axios";
import {
  cancelStripeSubscriptionAtPeriodEnd,
  checkoutSession,
  constructEvent,
  getAllActiveProducts,
  getAllRecurringPrices,
  getStripeProduct,
  getStripeSubscription,
  scheduleSubscriptionDowngrade,
  cancelSubscriptionSchedule,
  getSubscription,
  upgradeSubscription,
} from "../services/services.js";
import { getUserDetails, Log, updateUserCredits } from "../supabase.js";
import { configCredits } from "../constants/constants.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const client_endpoint =
	process.env.NODE_ENV !== "production"
		? "http://localhost:5173"
		: "https://dev-enrichiq.vercel.app"

// GET OPERATION - ENDPOINTS

export async function getActiveProducts(req, res) {
  try {
    const data = await getAllActiveProducts();
    res.saveToCache(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

export async function getRecurringPrices(req, res) {
  try {
    const { product_id } = req.query;
    const data = await getAllRecurringPrices(product_id);

    res.saveToCache(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

export async function getOwnSubscription(req, res) {
  try {
    const { subscription_id } = req.query;
    console.log("Received subscription_id:", subscription_id);

    if (!subscription_id) {
      throw new Error("Missing subscription ID");
    }
    const subscription = await getStripeSubscription(subscription_id);

    if (subscription && subscription.items.data.length > 0) {
      const product_id = subscription.items.data[0].price.product;

      const product = await getStripeProduct(product_id);

      subscription.product = {
        name: product?.name,
        description: product?.description,
      };
    }
    res.saveToCache(subscription);
    res.status(200).json(subscription);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

export async function getSubscriptionDetails(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const customers = await stripe.customers.list({ email });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customers.data[0];
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    console.log(subscriptions);
    const subscription = subscriptions.data.find(
      (subscription) => subscription.status !== "canceled"
    );

    if (!subscription) {
      return res.status(404).json({ error: "Active subscription not found" });
    }
    res.saveToCache({
      subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      customer_id: customer.id,
      price_id: subscription.items.data[0].price.id,
      schedule: subscription.schedule,
      cancel_at: subscription.cancel_at,
    });
    return res.status(200).json({
      subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      customer_id: customer.id,
      price_id: subscription.items.data[0].price.id,
      schedule: subscription.schedule,
      cancel_at: subscription.cancel_at,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error.message);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
}

// UTIL ENDPOINTS

export async function subscribeUser(req, res) {
  try {
    const { price_id, email } = req.body;
    console.log(email);
    const alreadyHaveSubscription = await getSubscription(email);
    if (
      alreadyHaveSubscription?.subscription_id &&
      alreadyHaveSubscription?.status !== "canceled" &&
      alreadyHaveSubscription?.status !== "incomplete"
    ) {
      return res
        .status(400)
        .json({ error: "Already have an active subscription" });
    }

    const session = await checkoutSession({ price_id, email });

    if (session?.url) {
      return res.status(200).json({ url: session.url });
    } else {
      throw new Error("Failed to create checkout session");
    }
  } catch (err) {
    // Handling errors
    return res.status(400).json({ error: err.message });
  }
}

export async function schedule(req, res) {
  const scheduleId = req.query.scheduleId;
  try {
    const subscriptionSchedule = await stripe.subscriptionSchedules.retrieve(
      scheduleId
    );
    res.saveToCache(subscriptionSchedule);
    res.json(subscriptionSchedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateSubscription(req, res) {
  try {
    const { subscription_id, price_id } = req.body;
    console.log(subscription_id);
    const subscription = await getStripeSubscription(subscription_id);
    console.log(subscription);

    if (!subscription || subscription.status === "canceled") {
      throw new Error("You do not have any active subscription");
    }

    if (subscription.plan.id === price_id) {
      throw new Error(
        "This pricing subscription is already active on your account"
      );
    }

    if (subscription.schedule) {
      await cancelSchedule(subscription.schedule);
    }


    const isUpgrade =
			configCredits[subscription.plan.id] < configCredits[price_id]

    if (isUpgrade) {
      try {
        const upgradedSubscription = await upgradeSubscription(
          subscription.id,
          price_id
        );
        
        if (upgradedSubscription?.error) {
					throw new Error(upgradedSubscription?.error)
				}
        return res.status(200).json({
          message: `Updagre successfull, (generating invoice) credits will be added now..`,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          message: err.message,
        });
      }
    } else {
      try {
        const schedule = await scheduleSubscriptionDowngrade(
          subscription.id,
          price_id
        );
        console.log("thandi")
        if (!schedule) {
          throw new Error("Failed to schedule downgrade subscription");
        }
        return res.status(200).json({
          message: `Subscription updated successfully. The invoice will be billed on ${subscription?.current_period_end}`,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          message: err.message,
        });
      }
    }
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
}

// CANCEL OPERATION - ENDPOINTS

export async function cancelSubscription(req, res) {
  const { email } = req.body;
  const subscription = await getSubscription(email);
  try {
    if (!subscription?.subscription_id) {
      throw new Error("You do not have any subscription");
    }

    if (subscription.schedule) {
      await cancelSchedule(subscription.schedule);
    }

    const cancelSubscription = await cancelStripeSubscriptionAtPeriodEnd(
      subscription.subscription_id
    );
    if (!cancelSubscription) {
      throw new Error("Error in scheduling stripe subscription cancellation");
    }

    await Log(
      subscription.customer,
      `Subscription cancellation scheduled: ${subscription.subscription_id}`
    );

    return res.status(200).json({
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (err) {
    if (subscription && subscription.customer) {
      await Log(
        subscription.customer,
        `Error in scheduling subscription cancellation: ${err.message}`
      );
    }

    res.status(400).json({
      message: err.message,
    });
  }
}

async function cancelSchedule(scheduleId) {
  try {
    const cancelledSchedule = await cancelSubscriptionSchedule(scheduleId);
    if (!cancelledSchedule) {
      throw new Error("Subscription schedule not cancelled!");
    }
    console.log("Subscription cancelled.");
  } catch (err) {
    console.log("Error occurred during canceling Schedule: ", err);
    res.send(400).json({
      message: err.message,
    });
  }
}

// PORTAL ENDPOINTS

export async function createCustomerPortalSession(req, res) {
  const { customerId } = req.body;
  console.log(customerId);
  const return_url = `${client_endpoint}/settings`;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url,
    });

    console.log("Customer portal session created:", session);
    res.status(200).json({
      session: session,
    });
  } catch (error) {
    console.error("Error creating customer portal session:", error.message);
    res.status(500).json({
      message: "Error in creating customer portal session",
    });
  }
}

export function healthCheck(req, res) {
  res.json({ message: "Captain, I am live!" });
}

//------------------------------------HANDLING WEBHOOKS FUNCTION ------------------------------------------ //

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers["stripe-signature"];
    let event = null;
    try {
      event = await constructEvent(req.rawBody, signature);
    } catch (error) {
      console.error(`Stripe Webhook error: ${error.message}`);
      throw new Error("Error in verifying stripe subscription");
    }
    console.log(`Stripe Webhook event's type: ${event.type}`);
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        const subscriptionId = checkoutSessionCompleted.subscription;
        const customer_email = checkoutSessionCompleted.customer_details.email;
        const userDetails = await getUserDetails(customer_email);
        const subscriptionDetails = await getStripeSubscription(subscriptionId);
        const newPriceID = subscriptionDetails.items.data[0].price.id;
        const availableCredits = parseInt(userDetails.credits);
     
        if (
					userDetails &&
					checkoutSessionCompleted.payment_status === "paid" &&
					configCredits[newPriceID]
				) {
					console.log(configCredits[newPriceID])
					console.log(newPriceID)
					console.log("credits")

					const newCredits = availableCredits + configCredits[newPriceID]
					await updateUserCredits(customer_email, newCredits)
					await Log(
						subscriptionDetails.customer,
						`Received ${configCredits[newPriceID]} credits for ${subscriptionId}`
					)
				}
        await Log(
          subscriptionDetails.customer,
          `Subscribed to ${newPriceID} successfully`
        );
        break;
      case "invoice.payment_succeeded":
        const invoicePaymentSucceeded = event.data.object;
        if (
          invoicePaymentSucceeded.billing_reason === "subscription_cycle" ||
          invoicePaymentSucceeded.billing_reason === "manual" ||
          invoicePaymentSucceeded.billing_reason === "subscription_update"
        ) {
          const subscriptionId = invoicePaymentSucceeded.subscription;
          const customer_email = invoicePaymentSucceeded.customer_email;
          const userDetails = await getUserDetails(customer_email);
          const subscriptionDetails = await getStripeSubscription(
            subscriptionId
          );
          const newPriceID = subscriptionDetails.items.data[0].price.id;
          const availableCredits = parseInt(userDetails.credits);

          if (userDetails?.credits && configCredits[newPriceID]) {
						const newCredits = availableCredits + configCredits[newPriceID]

						console.log(configCredits[newPriceID])
						console.log(newPriceID)
						console.log("credits")
						await updateUserCredits(customer_email, newCredits)
						await Log(
							subscriptionDetails.customer,
							`Received ${configCredits[newPriceID]} credits for ${subscriptionId}`
						)
					}
          await Log(
            subscriptionDetails.customer,
            `Invoice billed for price Id: ${newPriceID}`
          );
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).send("Event received");
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
  }
}


// n8nCall forward call to n8n API endpoint
export async function n8nCall(req, res) {
  try {
    const { headers, body } = req;
    const customerEmail = headers['request-email'] || headers['Request-Email'];

    if (!body) {
      return res.status(400).json({ message: 'Bad Request: Missing formData or lead in formData' });
    }

    const response = await axios.post(
      'https://n8n.cloud.zspirelabs.com/webhook/06fbc03e-a050-4545-829b-a0fd462e885e',
      body
    );

    if (response.status === 200) {

      if (!customerEmail) {
        console.error('Request-Email header is missing');
        return;
      }

      const userDetails = await getUserDetails(customerEmail);
      
      const availableCredits = parseInt(userDetails.credits, 10);
      const leadCredits = parseInt(body.formData.lead,10);

      if (isNaN(availableCredits) || isNaN(leadCredits)) {
        console.error('Invalid credit values');
        return res.status(500).json({ message: "Internal server error" })
        ;
      }

      const newCredits = availableCredits - leadCredits;
      if (newCredits < 0) {
        console.error('Insufficient credits');
        return res.status(500).json({ message: "Insufficient credits" });
      }

      await updateUserCredits(customerEmail, newCredits);
      console.log('Updated user credits')

      res.status(200).json(response.data)
    }
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}