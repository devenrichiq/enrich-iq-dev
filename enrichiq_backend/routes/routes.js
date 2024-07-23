import express from "express";
import {
  cancelSubscription,
  getActiveProducts,
  getOwnSubscription,
  getRecurringPrices,
  handleWebhook,
  healthCheck,
  subscribeUser,
  updateSubscription,
  schedule,
  getSubscriptionDetails,
  createCustomerPortalSession,
  n8nCall,
  
} from "../controller/controllers.js";
import auth from "../middleware/auth.js";
import bodyParser from "body-parser";
import { cancelSubscriptionSchedule, changeStripeEmail } from "../services/services.js";
import cacheMiddleware from "../middleware/cacheMiddleware.js";

const router = express.Router();

// All routes (api endpoints)

router.post("/subscribe", auth, subscribeUser);

// new end point for routing an api 
router.post("/n8n", n8nCall );

router.patch("/update-subscription", auth, updateSubscription)

router.get("/schedule", auth, cacheMiddleware, schedule)

router.patch("/cancel-subscription",auth, cancelSubscription);

router.post("/change-email",auth, changeStripeEmail)
router.post(
	"/stripe/webhook",
	bodyParser.raw({ type: "application/json" }),
	handleWebhook
)
router.get("/products", auth, cacheMiddleware, getActiveProducts)

router.get("/me", auth, cacheMiddleware, getOwnSubscription)

router.get("/prices", auth, cacheMiddleware, getRecurringPrices)

router.get("/ping", healthCheck);

router.post("/create_customer_portal_session",auth, createCustomerPortalSession)

router.get("/subscription-id", auth, cacheMiddleware, getSubscriptionDetails)

router.get("/", (req, res) => {
  res.send("Hello world!");
});

export default router;
