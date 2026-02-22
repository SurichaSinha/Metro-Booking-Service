import { describe, it, expect } from 'vitest';
import { findRoute, findAllRoutes } from './routeCalculator';

describe('routeCalculator', () => {
  describe('findRoute', () => {
    it('finds a route on the same line', () => {
      const route = findRoute('danapur-cantonment', 'patna-junction');
      
      expect(route).not.toBeNull();
      expect(route.segments).toHaveLength(1);
      expect(route.segments[0].line.id).toBe('red');
      expect(route.path[0]).toBe('danapur-cantonment');
      expect(route.path[route.path.length - 1]).toBe('patna-junction');
    });

    it('finds a route with interchange', () => {
      const route = findRoute('danapur-cantonment', 'new-isbt');
      
      expect(route).not.toBeNull();
      expect(route.interchanges).toBe(1);
      expect(route.segments.length).toBeGreaterThan(1);
      expect(route.path).toContain('patna-junction');
    });

    it('returns null for invalid source station', () => {
      const route = findRoute('invalid-station', 'patna-junction');
      expect(route).toBeNull();
    });

    it('returns null for invalid destination station', () => {
      const route = findRoute('danapur-cantonment', 'invalid-station');
      expect(route).toBeNull();
    });

    it('calculates correct fare based on distance', () => {
      const shortRoute = findRoute('patna-junction', 'gandhi-maidan');
      expect(shortRoute.fare).toBe(15);

      const longRoute = findRoute('danapur-cantonment', 'new-isbt');
      expect(longRoute.fare).toBeGreaterThan(15);
    });

    it('calculates total duration correctly', () => {
      const route = findRoute('danapur-cantonment', 'patna-junction');
      
      const expectedDuration = route.segments.reduce((sum, seg) => sum + seg.duration, 0);
      expect(route.totalDuration).toBe(expectedDuration);
    });

    it('counts total stops correctly', () => {
      const route = findRoute('danapur-cantonment', 'bailey-road');
      
      expect(route.totalStops).toBe(route.path.length);
    });
  });

  describe('findAllRoutes', () => {
    it('returns an array of routes', () => {
      const routes = findAllRoutes('danapur-cantonment', 'patna-junction');
      
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('marks the first route as recommended', () => {
      const routes = findAllRoutes('danapur-cantonment', 'new-isbt');
      
      expect(routes[0].isRecommended).toBe(true);
    });

    it('returns empty array for invalid routes', () => {
      const routes = findAllRoutes('invalid', 'also-invalid');
      expect(routes).toHaveLength(0);
    });
  });
});
