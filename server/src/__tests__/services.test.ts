import { describe, it, expect } from 'vitest';
import { dispatchAlertWebhook } from '../services/webhookService';
import { enrichIOCData } from '../services/threatEnrichment';

describe('Services Unit Tests', () => {
  describe('webhookService', () => {
    it('should log and return true when WEBHOOK_ALERT_URL is not configured', async () => {
      delete process.env.WEBHOOK_ALERT_URL;
      const result = await dispatchAlertWebhook({
        alertId: 'ALT-TEST-100',
        timestamp: new Date().toISOString(),
        title: 'SYN Flood Anomaly',
        severity: 'Critical',
        threatScore: 98,
        sourceIp: '185.220.101.5',
        attackCategory: 'DDoS SYN Flood',
        recommendation: 'Block IP via iptables',
      });

      expect(result).toBe(true);
    });
  });

  describe('threatEnrichment', () => {
    it('should enrich high risk IP IOCs correctly', () => {
      const enriched = enrichIOCData('185.220.101.5', 'IPv4');

      expect(enriched.ioc).toBe('185.220.101.5');
      expect(enriched.riskLevel).toBe('Critical');
      expect(enriched.riskScore).toBe(95);
      expect(enriched.associatedThreatActors).toContain('APT-29 (Cozy Bear)');
    });

    it('should assign medium risk to standard IOCs', () => {
      const enriched = enrichIOCData('10.0.0.5', 'IPv4');

      expect(enriched.ioc).toBe('10.0.0.5');
      expect(enriched.riskLevel).toBe('Medium');
      expect(enriched.riskScore).toBe(50);
    });
  });
});
