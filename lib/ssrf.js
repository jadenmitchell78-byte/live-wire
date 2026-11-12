/**
 * SSRF Guard for Live Wire Proxy
 * Blocks private networks, loopbacks, link-local addresses, and non-HTTP protocols.
 */

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '::',
  '[::1]',
  'localhost.localdomain'
]);

export function isSafeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol: only http and https are allowed' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Block known host aliases
    if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { safe: false, reason: 'Access to loopback/internal hosts is blocked' };
    }

    // Check IPv4 addresses
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octets = ipv4Match.slice(1, 5).map(Number);
      if (octets.some((o) => o < 0 || o > 255)) {
        return { safe: false, reason: 'Invalid IP address' };
      }

      const [o1, o2] = octets;

      // 127.0.0.0/8 (Loopback)
      if (o1 === 127) return { safe: false, reason: 'Loopback IP blocked' };

      // 0.0.0.0/8 (Current network)
      if (o1 === 0) return { safe: false, reason: 'Default route blocked' };

      // 10.0.0.0/8 (Private RFC1918)
      if (o1 === 10) return { safe: false, reason: 'Private 10.x IP blocked' };

      // 172.16.0.0/12 (Private RFC1918: 172.16 - 172.31)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return { safe: false, reason: 'Private 172.x IP blocked' };

      // 192.168.0.0/16 (Private RFC1918)
      if (o1 === 192 && o2 === 168) return { safe: false, reason: 'Private 192.168.x IP blocked' };

      // 169.254.0.0/16 (Link-local / AWS metadata 169.254.169.254)
      if (o1 === 169 && o2 === 254) return { safe: false, reason: 'Link-local/metadata IP blocked' };

      // 100.64.0.0/10 (Carrier NAT)
      if (o1 === 100 && o2 >= 64 && o2 <= 127) return { safe: false, reason: 'CGNAT IP blocked' };
    }

    // Check IPv6 addresses
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      const rawIpv6 = hostname.slice(1, -1).toLowerCase();
      if (rawIpv6 === '::1' || rawIpv6.startsWith('fe80:') || rawIpv6.startsWith('fc00:') || rawIpv6.startsWith('fd00:')) {
        return { safe: false, reason: 'Private IPv6 blocked' };
      }
    }

    return { safe: true, url: parsed.toString() };
  } catch (err) {
    return { safe: false, reason: 'Malformed URL' };
  }
}
