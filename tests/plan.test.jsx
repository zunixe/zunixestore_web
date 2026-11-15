import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { planCan, planRequired, planRank, FEATURE_MIN_PLAN } from '../src/features/subscriptions/usePlan';
import UpgradeCard from '../src/features/subscriptions/UpgradeCard';

describe('planCan — gating fitur per paket', () => {
  it('lite tidak bisa fitur berbayar', () => {
    expect(planCan('lite', 'reviews')).toBe(false);
    expect(planCan('lite', 'loyalty')).toBe(false);
    expect(planCan('lite', 'open_order')).toBe(false);
    expect(planCan('lite', 'unlimited_products')).toBe(false);
  });
  it('basic: review & open-order boleh, loyalty tidak', () => {
    expect(planCan('basic', 'reviews')).toBe(true);
    expect(planCan('basic', 'open_order')).toBe(true);
    expect(planCan('basic', 'loyalty')).toBe(false);
    expect(planCan('basic', 'unlimited_reports')).toBe(false);
  });
  it('business: loyalty boleh, enterprise-only tidak', () => {
    expect(planCan('business', 'loyalty')).toBe(true);
    expect(planCan('business', 'free_domain')).toBe(true);
    expect(planCan('business', 'unlimited_products')).toBe(false);
  });
  it('enterprise bisa semua', () => {
    Object.keys(FEATURE_MIN_PLAN).forEach((f) => expect(planCan('enterprise', f)).toBe(true));
  });
  it('plan tak dikenal diperlakukan seperti lite', () => {
    expect(planCan('ngawur', 'reviews')).toBe(false);
    expect(planRank('ngawur')).toBe(0);
  });
  it('requiredPlan memetakan nama paket', () => {
    expect(planRequired('reviews')).toBe('Basic');
    expect(planRequired('loyalty')).toBe('Business');
    expect(planRequired('unlimited_products')).toBe('Enterprise');
  });
});
