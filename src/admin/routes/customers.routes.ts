import { Router } from "express";
import { CustomersService } from "../../modules/customers/customers.service";
import { DB } from "../../core/database";

export const customersRouter = (pool: DB) => {
  const router = Router();
  const customersService = new CustomersService(pool);

  /* Create customer */
  router.post("/", async (req, res) => {
    try {
      const customer = await customersService.create(req.body);
      res.status(201).json(customer);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message || "Failed to create customer" });
    }
  });

  /* Get all customers */
  router.get("/", async (req, res) => {
    try {
      const customers = await customersService.findAll();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  router.get("/count", async (req, res) => {
    try {
      const result = await customersService.count();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch customer count" });
    }
  });

  /* Get customer by ID */
  router.get("/:id", async (req, res) => {
    try {
      const customer = await customersService.findById(req.params.id);
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  /* Update customer */
  router.put("/:id", async (req, res) => {
    try {
      const customer = await customersService.update(req.params.id, req.body);
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  /* Delete customer */
  router.delete("/:id", async (req, res) => {
    try {
      const result = await customersService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  /*
   * Connect payment gateway to customer
   * Call this after creating customer in Stripe/Razorpay
   * Body: { paymentGateway: 'stripe', gatewayCustomerId: 'cus_xxxxx' }
   */
  router.patch("/:id/connect-gateway", async (req, res) => {
    try {
      const customer = await customersService.connectPaymentGateway(
        req.params.id,
        req.body,
      );
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: "Failed to connect payment gateway" });
    }
  });

  /*
   * Save payment method to customer
   * Call this after customer adds their card
   * Body: { paymentMethodId: 'pm_xxxxx' }
   */
  router.patch("/:id/save-payment-method", async (req, res) => {
    try {
      const customer = await customersService.savePaymentMethod(
        req.params.id,
        req.body,
      );
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: "Failed to save payment method" });
    }
  });

  return router;
};
