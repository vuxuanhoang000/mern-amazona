import express from "express";
import Order from "../models/orderModel.js";
import { isAuth } from "../utils.js";
const orderRouter = express.Router();
orderRouter.post("/", isAuth, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;
  const newOrder = new Order({
    orderItems: orderItems.map((x) => ({ ...x, product: x._id })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    user: req.user._id,
  });
  const order = await newOrder.save();
  res.status(201).send({ message: "New Order Created", order });
});
orderRouter.get("/mine", isAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  return res.send(orders);
});
orderRouter.get("/:id", isAuth, async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId);
  if (order) {
    return res.send(order);
  } else {
    return res.staus(404).send({ message: "Order Not Found" });
  }
});
orderRouter.put("/:id/pay", isAuth, async (req, res) => {
  const { id: orderId } = req.params;
  const { id, status, update_time, email_address } = req.body;
  const order = await Order.findById(orderId);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id,
      status,
      update_time,
      email_address,
    };

    const updatedOrder = await order.save();
    return res.send({ message: "Order Paid", order: updatedOrder });
  } else {
    return res.status(404).send({ message: "Order Not Found" });
  }
});
export default orderRouter;
