# Portfolio auth.md

This document explains how autonomous AI agents can register and authenticate with the portfolio's API.

## Discovery
The API and OAuth discovery documents are available at:
- **API Catalog**: `/.well-known/api-catalog`
- **Protected Resource Metadata**: `/.well-known/oauth-protected-resource`
- **Authorization Server Metadata**: `/.well-known/oauth-authorization-server` (and `/openid-configuration`)

## Agent Registration

We support **Anonymous** agent registration. AI agents can request an API key dynamically without requiring pre-existing user accounts.

### 1. Anonymous Registration Flow
To register an agent, make a `POST` request to the registration URI:
- **Endpoint**: `https://design-matweenko.vercel.app/oauth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Payload:**
```json
{
  "identity_type": "anonymous",
  "agent_name": "MyAutonomousAgent/1.0"
}
```

**Response Payload:**
```json
{
  "api_key": "sec_agent_xxxxxx",
  "expires_in": 31536000
}
```

## Credential Usage
Include the obtained API key as a Bearer token in the `Authorization` header for all requests to protected API resources:
```http
Authorization: Bearer sec_agent_xxxxxx
```
