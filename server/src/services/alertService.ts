import http from 'http';
import https from 'https';

export interface SecurityAlertPayload {
  alertId: string;
  incidentCode: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  threatScore: number;
  sourceIp: string;
  targetIp: string;
  timestamp: string;
  description: string;
  recommendedAction: string;
}

type AlertListener = (alert: SecurityAlertPayload) => void;

class AlertService {
  private listeners: AlertListener[] = [];
  private webhookUrls: string[] = [];

  /**
   * Register a listener for real-time alert events (e.g. WebSocket streamer).
   */
  public subscribe(listener: AlertListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Add an external Webhook URL endpoint for SIEM / Slack alerts.
   */
  public addWebhookUrl(url: string) {
    if (url && !this.webhookUrls.includes(url)) {
      this.webhookUrls.push(url);
    }
  }

  /**
   * Dispatch a critical security alert to subscribers and configured webhooks.
   */
  public dispatchAlert(alert: SecurityAlertPayload) {
    console.log(`[ALERT DISPATCHER] Triggered ${alert.severity} alert: ${alert.title} (${alert.sourceIp} -> ${alert.targetIp})`);

    // Notify in-process subscribers (WebSocket)
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (err) {
        console.error('[ALERT DISPATCHER] Error in subscriber callback:', err);
      }
    });

    // Post to external Webhooks asynchronously
    this.webhookUrls.forEach(url => {
      this.sendWebhookPayload(url, alert);
    });
  }

  private sendWebhookPayload(urlStr: string, payload: SecurityAlertPayload) {
    try {
      const url = new URL(urlStr);
      const data = JSON.stringify({
        text: `🚨 *IntruShield SOC Alert: ${payload.severity}* - ${payload.title}`,
        alert: payload,
      });

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      });

      req.on('error', err => {
        console.error(`[ALERT WEBHOOK] Failed to dispatch payload to ${urlStr}:`, err.message);
      });

      req.write(data);
      req.end();
    } catch (err: any) {
      console.error(`[ALERT WEBHOOK] Invalid Webhook URL ${urlStr}:`, err.message);
    }
  }
}

export const alertService = new AlertService();
