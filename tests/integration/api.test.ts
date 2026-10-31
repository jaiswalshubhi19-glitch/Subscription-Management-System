import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('SubscriptIQ API Integration Tests', () => {
  const app = createApp();

  it('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.platform).toBe('SubscriptIQ API');
  });

  it('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api-docs.json serves valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('SubscriptIQ REST API');
    expect(res.body.paths).toHaveProperty('/auth/register');
    expect(res.body.paths).toHaveProperty('/subscriptions');
    expect(res.body.paths).toHaveProperty('/revenue-protection/overview');
  });

  it('POST /api/v1/auth/register validates weak password and returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@domain.com',
        password: 'weak', // fails length and special char regex
        name: 'Test User',
        organizationName: 'Test Org',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('Protected endpoint GET /api/v1/organization blocks unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/organization');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/Authentication required/i);
  });

  it('Protected endpoint GET /api/v1/subscriptions blocks unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/subscriptions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Protected endpoint GET /api/v1/revenue-protection/overview blocks unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/revenue-protection/overview');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
