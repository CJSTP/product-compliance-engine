"""Seed sample products for demo purposes."""
import requests
import json

BASE = "http://localhost:8001/api"

products = [
    {
        "name": "FlexPay BNPL",
        "product_type": "bnpl",
        "customer_segment": "consumer",
        "target_states": ["CA", "TX", "NY", "FL", "IL", "WA", "CO"],
        "description": "Buy now pay later product for e-commerce checkout — 4 equal installments, 0% APR.",
        "key_features": ["interest-free installments", "soft credit check", "merchant integration"],
        "submitted_by": "J. Rivera",
        "target_launch_date": "2026-06-01",
    },
    {
        "name": "CryptoConnect Exchange",
        "product_type": "crypto_exchange",
        "customer_segment": "consumer",
        "target_states": ["NY", "CA", "TX", "FL", "WA", "GA", "NV", "IL"],
        "description": "Retail cryptocurrency exchange supporting BTC, ETH, and select altcoins.",
        "key_features": ["crypto trading", "wallet custody", "staking", "international transfers"],
        "submitted_by": "M. Thompson",
        "target_launch_date": "2026-09-01",
    },
    {
        "name": "SendIt Remittance",
        "product_type": "foreign_remittance",
        "customer_segment": "consumer",
        "target_states": ["CA", "TX", "NY", "FL", "NJ", "GA"],
        "description": "International remittance service targeting Latin America and Southeast Asia corridors.",
        "key_features": ["international transfers", "cross-border payments", "mobile app"],
        "submitted_by": "A. Patel",
        "target_launch_date": "2026-05-15",
    },
    {
        "name": "QuickLend Personal Loans",
        "product_type": "personal_lending",
        "customer_segment": "consumer",
        "target_states": ["CA", "TX", "OH", "PA", "NC", "VA", "TN"],
        "description": "Unsecured personal loans from $1,000 to $25,000 with 12–60 month terms.",
        "key_features": ["credit underwriting", "automated decisioning", "direct deposit disbursement"],
        "submitted_by": "S. Chen",
        "target_launch_date": "2026-04-30",
    },
    {
        "name": "VaultCard Prepaid",
        "product_type": "prepaid_card",
        "customer_segment": "consumer",
        "target_states": ["CA", "TX", "NY", "FL", "IL"],
        "description": "Reloadable prepaid debit card with budgeting tools and no overdraft.",
        "key_features": ["reloadable prepaid", "no credit check", "mobile wallet compatible"],
        "submitted_by": "L. Johnson",
        "target_launch_date": "2026-07-01",
    },
]

for p in products:
    r = requests.post(f"{BASE}/products", json=p)
    if r.status_code == 201:
        print(f"Created: {p['name']} ({r.json()['product_id']})")
    else:
        print(f"Failed: {p['name']} — {r.text}")
