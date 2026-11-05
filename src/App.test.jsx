import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import {
  App,
  calculateActiveTime,
  calculateDebit,
  calculateTotalDebit,
  pipe,
  progress,
  sum,
} from './App';
import { data } from './DB';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  act(() => root.render(<App {...data} />));
  expect(div.querySelectorAll('.card')).toHaveLength(data.familyMembers.length);
  act(() => root.unmount());
});

describe('pipe', () => {
  it('returns the value when there are no functions', () => {
    expect(pipe(1)).toBe(1);
  });

  it('applies the functions from left to right', () => {
    expect(pipe(2, (x) => x + 1, (x) => x * 10)).toBe(30);
  });
});

describe('sum', () => {
  it('returns 0 for an empty list', () => {
    expect(sum([])).toBe(0);
  });

  it('adds up the values', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('handles decimals', () => {
    expect(sum([0.1, 0.2])).toBeCloseTo(0.3);
  });
});

describe('date dependent calculations', () => {
  const closedCost = {
    amount: 12,
    components: 6,
    from: new Date('2020-01-01T00:00:00'),
    to: new Date('2023-12-31T23:59:59'),
  };
  const openCost = {
    amount: 18,
    components: 6,
    from: new Date('2024-01-01T00:00:00'),
    to: null,
  };
  const costs = [closedCost, openCost];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-03-16T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateActiveTime', () => {
    it('returns 0 when activation is today', () => {
      expect(calculateActiveTime(new Date('2024-03-16T00:00:00'))).toBe(0);
    });

    it('counts the months since activation, rounded to one decimal', () => {
      expect(calculateActiveTime(new Date('2024-01-01T00:00:00'))).toBe(2.5);
    });

    it('counts across years', () => {
      expect(calculateActiveTime(new Date('2023-11-01T00:00:00'))).toBe(4.5);
    });

    it('is 0 when activation is in the future', () => {
      expect(calculateActiveTime(new Date('2024-05-16T00:00:00'))).toBe(0);
    });
  });

  describe('calculateDebit', () => {
    const period = (from, to) => ({
      from: new Date(from),
      to: new Date(to),
      amount: 18,
      components: 6,
    });

    it('charges the share of each member for whole months', () => {
      expect(
        calculateDebit(period('2024-01-01T00:00:00', '2024-04-01T00:00:00'))
      ).toBeCloseTo(9);
    });

    it('charges the fraction of a partial month', () => {
      expect(
        calculateDebit(period('2024-01-01T00:00:00', '2024-01-16T00:00:00'))
      ).toBeCloseTo(1.5);
    });

    it('is 0 for an empty period', () => {
      expect(
        calculateDebit(period('2024-01-01T00:00:00', '2024-01-01T00:00:00'))
      ).toBe(0);
    });

    it('measures days against the length of the starting month', () => {
      // 30 days out of February's 28, so 31.1 months instead of 31
      expect(
        calculateDebit({
          from: new Date('2021-02-01T00:00:00'),
          to: new Date('2023-08-31T23:59:59'),
          amount: 6,
          components: 6,
        })
      ).toBeCloseTo(31.1);
    });
  });

  describe('calculateTotalDebit', () => {
    it('returns 0 without costs', () => {
      expect(calculateTotalDebit(new Date('2024-01-01T00:00:00'), [])).toBe(0);
    });

    it('starts from the cost when activation comes first', () => {
      expect(
        calculateTotalDebit(new Date('2019-01-01T00:00:00'), costs)
      ).toBeCloseTo(96 + 7.5);
    });

    it('starts from activation when it falls within a cost', () => {
      expect(
        calculateTotalDebit(new Date('2023-07-01T00:00:00'), costs)
      ).toBeCloseTo(12 + 7.5);
    });

    it('skips costs that ended before activation', () => {
      expect(
        calculateTotalDebit(new Date('2024-02-01T00:00:00'), costs)
      ).toBeCloseTo(4.5);
    });

    it('skips a cost that ended exactly at activation', () => {
      expect(calculateTotalDebit(closedCost.to, costs)).toBeCloseTo(7.5);
    });

    it('charges an open cost up to today', () => {
      const activeFrom = new Date('2024-01-01T00:00:00');
      expect(calculateTotalDebit(activeFrom, [openCost])).toBeCloseTo(7.5);

      vi.setSystemTime(new Date('2024-04-01T12:00:00'));
      expect(calculateTotalDebit(activeFrom, [openCost])).toBeCloseTo(9);
    });

    it('charges nothing to a member activated in the future', () => {
      expect(calculateTotalDebit(new Date('2024-05-16T00:00:00'), [openCost])).toBe(0);
    });

    it('charges nothing for a cost starting in the future', () => {
      const futureCost = { ...openCost, from: new Date('2024-06-01T00:00:00') };
      expect(calculateTotalDebit(new Date('2024-01-01T00:00:00'), [futureCost])).toBe(0);
    });

    it('charges a cost ending in the future only up to today', () => {
      const endingCost = { ...openCost, to: new Date('2024-12-31T23:59:59') };
      expect(
        calculateTotalDebit(new Date('2024-01-01T00:00:00'), [endingCost])
      ).toBeCloseTo(7.5);
    });

    it('is not affected by a price change scheduled in advance', () => {
      const activeFrom = new Date('2024-01-01T00:00:00');
      const scheduled = [
        { ...openCost, to: new Date('2024-05-31T23:59:59') },
        { amount: 24, components: 6, from: new Date('2024-06-01T00:00:00'), to: null },
      ];
      expect(calculateTotalDebit(activeFrom, scheduled)).toBeCloseTo(
        calculateTotalDebit(activeFrom, [openCost])
      );
    });
  });

  describe('progress', () => {
    const activeFrom = new Date('2024-01-01T00:00:00');

    it('returns the active time', () => {
      expect(progress(20, activeFrom, [openCost]).activeTime).toBe(2.5);
    });

    it('has a positive credit when paid more than due', () => {
      expect(progress(20, activeFrom, [openCost]).credit).toBeCloseTo(12.5);
    });

    it('has a negative credit when paid less than due', () => {
      expect(progress(5, activeFrom, [openCost]).credit).toBeCloseTo(-2.5);
    });

    it('credits the full payment to a member activated in the future', () => {
      expect(progress(20, new Date('2024-05-16T00:00:00'), [openCost])).toEqual({
        activeTime: 0,
        credit: 20,
      });
    });
  });
});
