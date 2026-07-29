import jsPDF from 'jspdf';
import type { Incident } from '../types/incident';

export const generateIncidentPdf = (incident: Incident) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Background header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INTRUSHIELD SOC INCIDENT REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Incident Reference: ${incident.incidentCode} | Generated: ${new Date().toISOString()}`, 14, 26);

  // General Incident Details Section
  let y = 45;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('1. Incident Overview', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Title: ${incident.title}`, 14, y);
  y += 6;
  doc.text(`Category: ${incident.category} | Risk Level: ${incident.riskLevel} (Score: ${incident.riskScore}/100)`, 14, y);
  y += 6;
  doc.text(`AI Model Confidence: ${incident.confidenceScore}% | Status: ${incident.status}`, 14, y);
  y += 6;
  doc.text(`Primary Attacker IP: ${incident.primaryAttackerIp} -> Target Host: ${incident.targetedHostIp}`, 14, y);
  y += 6;
  doc.text(`Detected At: ${incident.detectedAt} | Affected Hosts: ${incident.affectedSystemsCount}`, 14, y);

  // XAI Explanation Rationale
  y += 12;
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('2. Explainable AI (XAI) Natural Language Rationale', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  const splitText = doc.splitTextToSize(incident.explanation.naturalLanguageReasoning, 180);
  doc.text(splitText, 14, y);
  y += splitText.length * 5 + 4;

  // SHAP Feature Impact
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('3. SHAP Feature Attribution Impact Vectors', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('Courier', 'bold');
  doc.text('Feature Name                     Observed Value    SHAP Impact Score', 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 6;

  doc.setFont('Courier', 'normal');
  incident.explanation.shapWaterfall.forEach((f) => {
    const featStr = f.featureName.padEnd(32, ' ').slice(0, 32);
    const valStr = String(f.value).padEnd(18, ' ').slice(0, 18);
    const scoreStr = `+${(f.impactScore * 100).toFixed(1)}%`;
    doc.text(`${featStr} ${valStr} ${scoreStr}`, 14, y);
    y += 5;
  });

  // Recommended Remediation Actions
  y += 8;
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('4. Recommended SOC Remediation Actions', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  incident.remediationActions.forEach((act, idx) => {
    doc.text(`${idx + 1}. [${act.category}] ${act.actionTitle} (Target: ${act.target})`, 14, y);
    y += 5;
    doc.text(`   Status: ${act.executed ? 'EXECUTED' : 'PENDING APPROVAL'} - ${act.recommendedReason}`, 14, y);
    y += 6;
  });

  // Footer Signature Line
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('IntruShield AI SOC Security Operations Engine - Cryptographically Authenticated Report', 14, 285);

  doc.save(`${incident.incidentCode}_SOC_Report.pdf`);
};
