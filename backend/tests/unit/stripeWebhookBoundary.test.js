const express = require('express');
const request = require('supertest');
const Stripe = require('stripe');
jest.mock('../../middleware/auth', () => ({ requireAuth: (req, res, next) => next() }));
jest.mock('../../services/stripeService', () => ({
  verifyWebhookSignature: jest.fn(), logWebhookEvent: jest.fn(), processWebhookEvent: jest.fn(),
}));
const service = require('../../services/stripeService');
const router = require('../../api/stripe');
const secret = 'whsec_test_only';
const payload = '{ "id": "evt_test", "type": "payment_intent.succeeded", "data": { "object": {} } }';
const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });

beforeEach(() => {
  jest.resetAllMocks();
  service.verifyWebhookSignature.mockImplementation((body, header) => Stripe.webhooks.constructEvent(body, header, secret));
  service.logWebhookEvent.mockResolvedValue(undefined);
  service.processWebhookEvent.mockResolvedValue(undefined);
});

function app() {
  const instance = express();
  instance.use(express.json({ verify: (req, res, body) => { req.rawBody = body.toString(); } }));
  instance.use('/api/stripe', router);
  return instance;
}

test('verifies original bytes after the app JSON parser and completes processing', async () => {
  const response = await request(app()).post('/api/stripe/webhook').set('Content-Type', 'application/json').set('stripe-signature', signature).send(payload);
  expect(response.status).toBe(200);
  expect(service.verifyWebhookSignature).toHaveBeenCalledWith(payload, signature);
  expect(service.processWebhookEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 'evt_test' }));
});

test('failed processing returns a retryable status instead of acknowledging success', async () => {
  service.processWebhookEvent.mockRejectedValue(new Error('Fulfillment unavailable'));
  const response = await request(app()).post('/api/stripe/webhook').set('Content-Type', 'application/json').set('stripe-signature', signature).send(payload);
  expect(response.status).toBe(500);
});

test('invalid signatures never reach fulfillment', async () => {
  const response = await request(app()).post('/api/stripe/webhook').set('Content-Type', 'application/json').set('stripe-signature', 'invalid').send(payload);
  expect(response.status).toBe(400);
  expect(service.processWebhookEvent).not.toHaveBeenCalled();
});
