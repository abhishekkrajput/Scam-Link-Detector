import { parse } from 'tldts';
import validator from 'validator';

export interface ScanResult {
  risk_score: number;
  status: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
}

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'update', 'bank', 'free', 'account', 'secure', 'billing',
  'signin', 'wp-admin', 'wp-content', 'gift', 'prize', 'win', 'reward', 'bonus',
  'urgent', 'action', 'required', 'official', 'support', 'helpdesk', 'service'
];

const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'click', 'gq', 'ml', 'ga', 'cf', 'tk', 'bid', 'loan', 'men', 'icu', 'monster', 'work'
];

const SHORTENERS = [
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee'
];

export function analyzeUrlHeuristics(url: string): ScanResult {
  const reasons: string[] = [];
  let score = 0;

  try {
    // Basic validation
    if (!validator.isURL(url)) {
      return { risk_score: 100, status: 'dangerous', reasons: ['Invalid URL format'] };
    }

    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const tldInfo = parse(hostname);

    // 1. HTTPS check
    if (parsed.protocol !== 'https:') {
      reasons.push('⚠️ Uses insecure HTTP protocol');
      score += 20;
    }

    // 2. IP address check
    if (validator.isIP(hostname)) {
      reasons.push('🚨 Uses IP address instead of domain name');
      score += 40;
    }

    // 3. URL length check
    if (url.length > 75) {
      reasons.push('⚠️ Unusually long URL');
      score += 15;
    }

    // 4. Subdomain check
    const subdomains = hostname.split('.').length - 2;
    if (subdomains >= 3) {
      reasons.push(`⚠️ Multiple subdomains detected (${subdomains})`);
      score += 15;
    }

    // 5. Suspicious TLD check
    if (tldInfo.publicSuffix && SUSPICIOUS_TLDS.includes(tldInfo.publicSuffix)) {
      reasons.push(`⚠️ Uses suspicious TLD (.${tldInfo.publicSuffix})`);
      score += 20;
    }

    // 6. Suspicious keywords check
    const lowerUrl = url.toLowerCase();
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => lowerUrl.includes(kw));
    if (foundKeywords.length > 0) {
      reasons.push(`⚠️ Contains suspicious keywords: ${foundKeywords.slice(0, 3).join(', ')}`);
      score += 15 * foundKeywords.length;
    }

    // 7. URL Shortener check
    if (SHORTENERS.some(s => hostname.includes(s))) {
      reasons.push('⚠️ Uses a URL shortener service');
      score += 10;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    let status: 'safe' | 'suspicious' | 'dangerous' = 'safe';
    if (score >= 70) status = 'dangerous';
    else if (score >= 30) status = 'suspicious';

    return { risk_score: score, status, reasons };
  } catch (e) {
    return { risk_score: 100, status: 'dangerous', reasons: ['Failed to parse URL'] };
  }
}
