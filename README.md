# Product Compliance Engine

A full-stack compliance tool that automates regulatory mapping and approval workflows for new fintech product launches. Submit a product, get an instant regulatory checklist, track it through a 5-stage approval pipeline, and enforce compliance gates before launch.

**Live Demo:** [product-compliance-engine.vercel.app](https://product-compliance-engine.vercel.app)

---

## The Problem

Fintechs launching new products face a fragmented compliance landscape: dozens of federal regulations, 50+ state licensing regimes, and no standardized process for tracking readiness before launch. Teams often discover gaps late — after legal review, after engineering investment, or after a regulator asks.

This tool addresses that by front-loading regulatory mapping at the point of product submission.

---

## What It Does

**Regulatory Mapping Engine**
Submit a product with its type, target states, customer segment, and key features. The engine automatically identifies every applicable requirement:

- Federal regulations (TILA/Reg Z, EFTA/Reg E, ECOA/Reg B, FCRA, BSA/AML, GLBA, UDAAP, MLA, Dodd-Frank remittance rules)
- State licensing (money transmitter licenses, consumer lending licenses, BNPL-specific frameworks, virtual currency / BitLicense)
- Consumer disclosures (fee disclosures, FDIC insurance notices, risk warnings)
- Data privacy (CCPA/CPRA, GLBA Safeguards Rule, biometric data laws)
- AML/BSA (FinCEN MSB registration, CDD Rule, OFAC sanctions screening)

**Launch Risk Score**
Each product receives a 0–100 risk score based on product type complexity, state footprint, regulatory requirement volume, and feature-level risk factors (crypto, cross-border, credit). Scores map to four risk levels: Low, Medium, High, Critical.

**5-Stage Approval Workflow**
Products move through a structured review pipeline with enforced gates:

```
Intake → Regulatory Assessment → Legal Review → Compliance Sign-off → Approved
                                                                     ↘ Rejected
```

Blocking requirements must be cleared before a stage can advance. Every transition is logged with the actor's name, timestamp, and notes — creating a full audit trail.

**Compliance Dashboard**
Pipeline view showing product counts by stage and risk level. Click any stage to filter the product list. Drill into individual products to manage their checklists and advance or reject them.

---

## Product Types Supported

| Product Type | Key Regulations Mapped |
|---|---|
| Buy Now Pay Later (BNPL) | TILA/Reg Z, ECOA, FCRA, state lending licenses, usury caps |
| Crypto Exchange | FinCEN MSB, BitLicense (NY), state MTLs, SEC/CFTC analysis |
| Foreign Remittance | Dodd-Frank remittance rule, FinCEN MSB, OFAC screening, state MTLs |
| Personal Lending | TILA/Reg Z, ECOA, FCRA, MLA, state lending licenses, usury caps |
| Prepaid Card | EFTA/Reg E Prepaid Rule, CARD Act, fee disclosures |
| Payment App | EFTA/Reg E, FinCEN MSB, state money transmitter licenses |
| Money Transfer | FinCEN MSB, state money transmitter licenses |
| Savings / Deposit | FDI Act / BaaS partner requirements, FDIC disclosure rules |

All product types receive universal requirements: BSA/AML program, FinCEN CDD Rule, GLBA privacy and safeguards, and UDAAP review.

---

## Feature-Level Triggers

Certain features trigger additional requirements regardless of product type:

- **Cryptocurrency** → SEC/CFTC asset classification, enhanced AML
- **Cross-border / international** → OFAC sanctions screening, remittance disclosures
- **Credit underwriting** → FDCPA collections compliance
- **Biometric data** → Illinois BIPA, Texas and Washington biometric privacy laws
- **California target states** → CCPA/CPRA compliance

---

## Tech Stack

**Backend**
- Python / FastAPI
- SQLAlchemy + SQLite
- Deployed on Render

**Frontend**
- React + TypeScript
- Vite
- Deployed on Vercel

---

## Local Development

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

**Seed sample data**
```bash
cd backend
source venv/bin/activate
python3 sample_data.py
```

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models (Product, ComplianceRequirement, StageEvent)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── regulatory_mapper.py   # Core engine: maps product → requirements
│   │   │   └── product_service.py     # CRUD, workflow logic, risk scoring
│   │   └── routes/         # FastAPI route handlers
│   └── main.py
└── frontend/
    └── src/
        ├── pages/          # Dashboard, ProductList, ProductDetail, NewProduct
        ├── components/     # RiskBadge, StageBadge, CategoryBadge
        └── services/       # API client
```

---

## Domain Context

Built to reflect real fintech compliance workflows. The regulatory mapping logic is grounded in:

- **FinCEN CDD Rule** (31 CFR 1020.210) — beneficial ownership and customer due diligence
- **CFPB examination procedures** — TILA, EFTA, ECOA, FCRA, UDAAP
- **FATF risk-based approach** — proportional compliance resource allocation
- **State money transmission law** — NMLS licensing requirements across all 50 states + DC
- **CFPB Prepaid Account Rule** (12 CFR Part 1005) — short-form and long-form fee disclosures
- **Dodd-Frank Act § 1073** — international remittance transfer rules
