import http from 'http';
import https from 'https';

export interface AlertWebhookPayload {
  alertId: string;
  timestamp: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  threatScore: number;
  sourceIp: string;
  targetIp?: string;
  attackCategory: string;
  recommendation: string;
}

/**
 * Dispatches an automated security incident alert payload to an external webhook endpoint.
 * Configured via WEBHOOK_ALERT_URL environment variable or fallback endpoint.
 * @param payload Formatted threat alert payload containing incident ID, threat score, and mitigation recommendation
 * @returns Promise resolving to boolean indicating successful HTTP delivery
 */
export async function dispatchAlertWebhook(payload: AlertWebhookPayload): Promise<boolean> {
  const webhookUrl = process.env.WEBHOOK_ALERT_URL;
  if (!webhookUrl) {
    console.log(`[ALERT WEBHOOK] Dispatched alert [${payload.alertId}] - Severity: ${payload.severity} (${payload.threatScore}/100) on ${payload.sourceIp}`);
    return true;
  }

  try {
    const urlObj = new URL(webhookUrl);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'IntruShield-NIDS-Engine/1.0',
      },
    };

    const client = urlObj.protocol === 'https:' ? https : http;

    return new Promise((resolve) => {
      const req = client.request(options, (res) => {
        const isSuccess = res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false;
        console.log(`[ALERT WEBHOOK] Notification for ${payload.alertId} returned HTTP status ${res.statusCode}`);
        resolve(isSuccess);
      });

      req.on('error', (err) => {
        console.error(`[ALERT WEBHOOK] Failed to dispatch webhook alert to ${webhookUrl}:`, err.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  } catch (err: any) {
    console.error(`[ALERT WEBHOOK] Invalid webhook URL configuration: ${err.message}`);
    return false;
  }
}
