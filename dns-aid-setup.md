# DNS for AI Discovery (DNS-AID) Setup Guide

To enable DNS-based agent discovery, you must configure DNS-AID records for your domain (RFC 9460 & draft-mozleywilliams-dnsop-dnsaid). 

Because DNS records are configured with your domain registrar or DNS hosting provider (e.g., Cloudflare, Route 53, or Namecheap), they cannot be deployed directly via git code modifications. Below are the exact records and instructions required to pass the discovery checks.

---

## 1. Required DNS Records

If your domain is `design-matweenko.vercel.app` (or a custom domain like `your-portfolio.com`), publish the following ServiceMode `SVCB` or `HTTPS` records:

### Option A: Using SVCB Records (Recommended)
Add the following resource records to your DNS zone file:

```dns
_index._agents.YOUR_DOMAIN. 3600 IN SVCB 1 YOUR_DOMAIN. alpn="a2a" port=443 mandatory=alpn,port
_a2a._agents.YOUR_DOMAIN.   3600 IN SVCB 1 YOUR_DOMAIN. alpn="a2a" port=443 mandatory=alpn,port
```

### Option B: Using HTTPS Records (Fallback for HTTPS endpoints)
If your DNS provider does not support `SVCB` but supports `HTTPS` records, publish:

```dns
_index._agents.YOUR_DOMAIN. 3600 IN HTTPS 1 YOUR_DOMAIN. alpn="a2a" port=443 mandatory=alpn,port
_a2a._agents.YOUR_DOMAIN.   3600 IN HTTPS 1 YOUR_DOMAIN. alpn="a2a" port=443 mandatory=alpn,port
```

*(Note: Replace `YOUR_DOMAIN` with your actual domain, e.g., `design-matweenko.vercel.app` or your custom domain).*

---

## 2. DNSSEC Requirement

The public discovery zone **must be signed with DNSSEC** so that validating resolvers (like Google DNS or Cloudflare DNS used by the `isitagentready.com` scanner) can return authenticated data.
- If you use **Cloudflare** for DNS, you can enable DNSSEC with a single click in the Cloudflare Dashboard under **DNS > Settings > DNSSEC**.
- If you use another provider, follow their guide to enable DNSSEC signing and publish the DS records at your registrar.

---

## 3. Important Note for Default Vercel Subdomains (`*.vercel.app`)

Vercel controls the `vercel.app` parent domain zone. Therefore:
1. **You cannot add custom DNS-AID SVCB/HTTPS records** under the `_agents.design-matweenko.vercel.app` namespace if you are using the default `.vercel.app` subdomain.
2. To pass the DNS-AID check, you must **bind a custom domain** (e.g. `yourdomain.com`) to your Vercel project, configure your DNS zone there, add the records above, and run the scanner against your custom domain.
