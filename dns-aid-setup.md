# DNS for AI Discovery (DNS-AID) Setup Guide

To enable DNS-based agent discovery, you must configure DNS-AID records for your domain (RFC 9460 & draft-mozleywilliams-dnsop-dnsaid). 

Because DNS records are configured with your domain registrar or DNS hosting provider (e.g., Cloudflare, Route 53, or Namecheap), they cannot be deployed directly via git code modifications. Below are the exact records and instructions required to pass the discovery checks.

---

## 1. Required DNS Records

If your domain is `www.ksenweb.com` (or `ksenweb.com`), publish the following ServiceMode `SVCB` or `HTTPS` records:

### Option A: Using SVCB Records (Recommended)
Add the following resource records to your DNS zone file:

```dns
_index._agents.ksenweb.com. 3600 IN SVCB 1 ksenweb.com. alpn="a2a" port=443 mandatory=alpn,port
_a2a._agents.ksenweb.com.   3600 IN SVCB 1 ksenweb.com. alpn="a2a" port=443 mandatory=alpn,port
```

### Option B: Using HTTPS Records (Fallback for HTTPS endpoints)
If your DNS provider does not support `SVCB` but supports `HTTPS` records, publish:

```dns
_index._agents.ksenweb.com. 3600 IN HTTPS 1 ksenweb.com. alpn="a2a" port=443 mandatory=alpn,port
_a2a._agents.ksenweb.com.   3600 IN HTTPS 1 ksenweb.com. alpn="a2a" port=443 mandatory=alpn,port
```

*(Note: Replace `ksenweb.com` with your actual domain).*

---

## 2. DNSSEC Requirement

The public discovery zone **must be signed with DNSSEC** so that validating resolvers (like Google DNS or Cloudflare DNS used by the `isitagentready.com` scanner) can return authenticated data.
- If you use **Cloudflare** for DNS, you can enable DNSSEC with a single click in the Cloudflare Dashboard under **DNS > Settings > DNSSEC**.
- If you use another provider, follow their guide to enable DNSSEC signing and publish the DS records at your registrar.

---

## 3. Custom Domain Status

Now that your custom domain `www.ksenweb.com` is connected to Vercel:
1. Configure the `_agents.ksenweb.com` SVCB or HTTPS records at your DNS registrar or DNS host (e.g. Cloudflare or your registrar).
2. Enable DNSSEC on `ksenweb.com`.
