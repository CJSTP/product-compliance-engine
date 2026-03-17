"""
Regulatory Mapper
Maps product type + target states to applicable compliance requirements.
Based on: TILA/Reg Z, EFTA/Reg E, ECOA/Reg B, FCRA, BSA/AML, GLBA, Dodd-Frank,
          state money transmitter licensing, state lending licensing.
"""

from app.models.product import (
    ProductType, CustomerSegment, RequirementCategory, RiskLevel
)

# States requiring money transmitter licenses
MONEY_TRANSMITTER_LICENSE_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
    "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
    "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX",
    "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

# States with specific lending license requirements
LENDING_LICENSE_STATES = [
    "CA", "TX", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI",
    "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI"
]

# States with specific BNPL / consumer finance laws
BNPL_REGULATED_STATES = ["CA", "NY", "CO", "CT", "IL", "UT", "WA"]

# States with strict crypto / digital asset licensing
CRYPTO_LICENSED_STATES = ["NY", "CA", "TX", "FL", "WA", "GA", "NV"]


def _state_list(target_states: list[str], required_states: list[str]) -> str:
    matches = [s for s in target_states if s in required_states]
    return ", ".join(sorted(matches)) if matches else "All applicable states"


def map_requirements(
    product_type: ProductType,
    customer_segment: CustomerSegment,
    target_states: list[str],
    key_features: list[str]
) -> list[dict]:
    """Return a list of requirement dicts for the given product profile."""
    reqs = []
    features_lower = [f.lower() for f in key_features]

    def has(keyword):
        return any(keyword in f for f in features_lower)

    # ── UNIVERSAL REQUIREMENTS ─────────────────────────────────────────────
    reqs.append({
        "category": RequirementCategory.aml_bsa,
        "title": "BSA / AML Program",
        "description": (
            "Establish a written AML program with internal controls, independent testing, "
            "a designated BSA officer, and ongoing training. File SARs and CTRs as required."
        ),
        "regulation_ref": "31 U.S.C. § 5318; 31 CFR Part 1020",
        "applies_to_states": None,
        "is_blocking": True,
    })
    reqs.append({
        "category": RequirementCategory.aml_bsa,
        "title": "FinCEN Customer Due Diligence (CDD) Rule",
        "description": (
            "Collect and verify beneficial ownership information for legal entity customers. "
            "Apply risk-based CDD procedures for all customers."
        ),
        "regulation_ref": "31 CFR 1020.210",
        "applies_to_states": None,
        "is_blocking": True,
    })
    reqs.append({
        "category": RequirementCategory.data_privacy,
        "title": "GLBA Privacy Notice",
        "description": (
            "Provide consumers with a clear and conspicuous privacy notice at account opening "
            "and annually thereafter. Describe information sharing practices and opt-out rights."
        ),
        "regulation_ref": "15 U.S.C. § 6801; 12 CFR Part 1016",
        "applies_to_states": None,
        "is_blocking": True,
    })
    reqs.append({
        "category": RequirementCategory.data_privacy,
        "title": "GLBA Safeguards Rule — Information Security Program",
        "description": (
            "Implement a written information security program with administrative, technical, "
            "and physical safeguards appropriate to the size and complexity of the institution."
        ),
        "regulation_ref": "16 CFR Part 314",
        "applies_to_states": None,
        "is_blocking": True,
    })
    reqs.append({
        "category": RequirementCategory.prohibited_practices,
        "title": "UDAAP Compliance Review",
        "description": (
            "Review all product terms, marketing materials, and disclosures for unfair, "
            "deceptive, or abusive acts or practices. CFPB has broad UDAAP authority over "
            "consumer financial products."
        ),
        "regulation_ref": "12 U.S.C. § 5531 (Dodd-Frank Act § 1031)",
        "applies_to_states": None,
        "is_blocking": True,
    })

    # ── BNPL ──────────────────────────────────────────────────────────────
    if product_type == ProductType.bnpl:
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Truth in Lending Act (TILA) / Reg Z — Closed-End Credit Disclosures",
            "description": (
                "Provide required closed-end credit disclosures including APR, finance charge, "
                "amount financed, and total of payments before consummation of credit. "
                "CFPB has taken the position that BNPL products are credit cards subject to Reg Z."
            ),
            "regulation_ref": "15 U.S.C. § 1601; 12 CFR Part 1026",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Equal Credit Opportunity Act (ECOA) / Reg B",
            "description": (
                "Provide adverse action notices when declining credit. Prohibit discrimination "
                "on the basis of race, color, religion, national origin, sex, marital status, age, "
                "or receipt of public assistance income."
            ),
            "regulation_ref": "15 U.S.C. § 1691; 12 CFR Part 1002",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Fair Credit Reporting Act (FCRA) — Permissible Purpose & Adverse Action",
            "description": (
                "Obtain consumer reports only for permissible purposes. Provide required "
                "adverse action notices citing credit report when declining or offering "
                "less favorable terms based on credit information."
            ),
            "regulation_ref": "15 U.S.C. § 1681; 12 CFR Part 1022",
            "applies_to_states": None,
            "is_blocking": True,
        })
        bnpl_states = _state_list(target_states, BNPL_REGULATED_STATES)
        if any(s in target_states for s in BNPL_REGULATED_STATES):
            reqs.append({
                "category": RequirementCategory.state_licensing,
                "title": "State BNPL / Consumer Finance Licensing",
                "description": (
                    f"Obtain required state consumer lending or sales finance licenses "
                    f"in: {bnpl_states}. These states have enacted or proposed specific "
                    f"BNPL regulatory frameworks or require a lender license for deferred payment products."
                ),
                "regulation_ref": "State consumer finance acts (varies by state)",
                "applies_to_states": bnpl_states,
                "is_blocking": True,
            })
        lending_states = _state_list(target_states, LENDING_LICENSE_STATES)
        if any(s in target_states for s in LENDING_LICENSE_STATES):
            reqs.append({
                "category": RequirementCategory.state_licensing,
                "title": "State Lending License",
                "description": (
                    f"Obtain a consumer lending or installment loan license in: {lending_states}."
                ),
                "regulation_ref": "State lending statutes (varies by state)",
                "applies_to_states": lending_states,
                "is_blocking": True,
            })
        reqs.append({
            "category": RequirementCategory.consumer_disclosure,
            "title": "State Usury / Interest Rate Compliance",
            "description": (
                "Confirm that all fees, charges, and imputed interest rates comply with state usury "
                "caps in target states. Some states cap consumer credit rates at 36% APR (including fees)."
            ),
            "regulation_ref": "State usury statutes (varies by state)",
            "applies_to_states": ", ".join(sorted(target_states)),
            "is_blocking": True,
        })

    # ── CRYPTO EXCHANGE ───────────────────────────────────────────────────
    elif product_type == ProductType.crypto_exchange:
        reqs.append({
            "category": RequirementCategory.aml_bsa,
            "title": "FinCEN MSB Registration — Money Services Business",
            "description": (
                "Register with FinCEN as a Money Services Business (MSB) in the category "
                "of money transmitter. File FinCEN Form 107. Renew every two years."
            ),
            "regulation_ref": "31 CFR § 1022.380",
            "applies_to_states": None,
            "is_blocking": True,
        })
        crypto_states = _state_list(target_states, CRYPTO_LICENSED_STATES)
        if any(s in target_states for s in CRYPTO_LICENSED_STATES):
            reqs.append({
                "category": RequirementCategory.state_licensing,
                "title": "State Virtual Currency / BitLicense",
                "description": (
                    f"Obtain virtual currency or money transmitter licenses in: {crypto_states}. "
                    f"New York requires a BitLicense (23 NYCRR Part 200). Other states require "
                    f"standard money transmitter licenses covering virtual currency."
                ),
                "regulation_ref": "23 NYCRR Part 200 (NY); state money transmitter acts",
                "applies_to_states": crypto_states,
                "is_blocking": True,
            })
        mt_states = _state_list(target_states, MONEY_TRANSMITTER_LICENSE_STATES)
        reqs.append({
            "category": RequirementCategory.state_licensing,
            "title": "State Money Transmitter Licenses",
            "description": (
                f"Obtain money transmitter licenses in all applicable states: {mt_states}. "
                f"Most states require licensure for businesses that transmit money, including crypto."
            ),
            "regulation_ref": "State money transmission acts (varies by state)",
            "applies_to_states": mt_states,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "SEC / CFTC Securities & Commodity Assessment",
            "description": (
                "Conduct a legal analysis of each digital asset listed to determine whether it "
                "is a security (subject to SEC registration/exemption) or a commodity (CFTC jurisdiction). "
                "Listing unregistered securities may violate the Securities Act of 1933."
            ),
            "regulation_ref": "15 U.S.C. § 77a (Securities Act); 7 U.S.C. § 1 (CEA)",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.consumer_disclosure,
            "title": "Risk Disclosure to Consumers",
            "description": (
                "Provide clear risk disclosures: crypto assets are highly volatile, not FDIC insured, "
                "and may lose all value. Some states (e.g., CA) require specific risk language."
            ),
            "regulation_ref": "State consumer protection statutes; CFPB guidance",
            "applies_to_states": None,
            "is_blocking": False,
        })

    # ── PREPAID CARD ──────────────────────────────────────────────────────
    elif product_type == ProductType.prepaid_card:
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "EFTA / Reg E — Prepaid Account Rule",
            "description": (
                "Comply with the CFPB Prepaid Account Rule: provide pre-acquisition disclosures "
                "(short form and long form), limit consumer liability for unauthorized transactions "
                "to $50, provide error resolution rights, and deliver periodic statements or "
                "account balance access."
            ),
            "regulation_ref": "15 U.S.C. § 1693; 12 CFR Part 1005",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "TILA / Reg Z — Credit Feature (if overdraft or credit offered)",
            "description": (
                "If the prepaid card includes a credit feature (e.g., overdraft line), "
                "Reg Z credit card rules apply: provide Schumer Box disclosures, comply "
                "with ability-to-repay rules, and restrict credit access during first 30 days."
            ),
            "regulation_ref": "12 CFR Part 1026 (Reg Z Prepaid-Credit Linkage Rule)",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.aml_bsa,
            "title": "FinCEN MSB Registration",
            "description": (
                "If issuing prepaid cards without a bank partner, register with FinCEN as an MSB. "
                "If issuing through a bank, confirm bank's BSA/AML program covers the product."
            ),
            "regulation_ref": "31 CFR § 1022.380",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.consumer_disclosure,
            "title": "Fee Disclosure — Short Form & Long Form",
            "description": (
                "Prepaid accounts must display a standardized short form fee disclosure on packaging "
                "and a long form disclosure listing all fees. Use CFPB-prescribed format."
            ),
            "regulation_ref": "12 CFR § 1005.18",
            "applies_to_states": None,
            "is_blocking": True,
        })

    # ── MONEY TRANSFER ────────────────────────────────────────────────────
    elif product_type in (ProductType.money_transfer, ProductType.foreign_remittance):
        reqs.append({
            "category": RequirementCategory.aml_bsa,
            "title": "FinCEN MSB Registration",
            "description": (
                "Register with FinCEN as a Money Services Business (money transmitter). "
                "File FinCEN Form 107. Renew every two years. Maintain agent lists."
            ),
            "regulation_ref": "31 CFR § 1022.380",
            "applies_to_states": None,
            "is_blocking": True,
        })
        mt_states = _state_list(target_states, MONEY_TRANSMITTER_LICENSE_STATES)
        reqs.append({
            "category": RequirementCategory.state_licensing,
            "title": "State Money Transmitter Licenses",
            "description": (
                f"Obtain money transmitter licenses in: {mt_states}. "
                f"Surety bond requirements vary by state (typically $25K–$500K+)."
            ),
            "regulation_ref": "State money transmission acts (varies by state)",
            "applies_to_states": mt_states,
            "is_blocking": True,
        })
        if product_type == ProductType.foreign_remittance:
            reqs.append({
                "category": RequirementCategory.federal_regulation,
                "title": "Dodd-Frank Remittance Transfer Rule",
                "description": (
                    "Provide pre-payment and receipt disclosures for international remittances: "
                    "exchange rate, fees, taxes, amount to be received, and date of availability. "
                    "Applies to providers sending 100+ remittances/year."
                ),
                "regulation_ref": "15 U.S.C. § 1693o-1; 12 CFR Part 1005 Subpart B",
                "applies_to_states": None,
                "is_blocking": True,
            })
            reqs.append({
                "category": RequirementCategory.aml_bsa,
                "title": "OFAC Sanctions Screening — International Transfers",
                "description": (
                    "Screen all international transfers against OFAC's SDN list and country-based "
                    "sanctions programs. Block and report prohibited transactions. Maintain screening "
                    "records for 5 years."
                ),
                "regulation_ref": "31 CFR Parts 500–598 (OFAC regulations)",
                "applies_to_states": None,
                "is_blocking": True,
            })

    # ── PERSONAL LENDING ──────────────────────────────────────────────────
    elif product_type == ProductType.personal_lending:
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Truth in Lending Act (TILA) / Reg Z",
            "description": (
                "Disclose APR, finance charge, amount financed, total of payments, and payment "
                "schedule before consummation. Provide right of rescission for certain secured loans."
            ),
            "regulation_ref": "15 U.S.C. § 1601; 12 CFR Part 1026",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Equal Credit Opportunity Act (ECOA) / Reg B",
            "description": (
                "Prohibit credit discrimination. Provide adverse action notices within 30 days. "
                "Collect and retain demographic data for certain loan types."
            ),
            "regulation_ref": "15 U.S.C. § 1691; 12 CFR Part 1002",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Fair Credit Reporting Act (FCRA)",
            "description": (
                "Pull consumer reports only for permissible purposes. Send adverse action notices "
                "citing the credit bureau and score used. Dispute and furnishing obligations apply "
                "if reporting to credit bureaus."
            ),
            "regulation_ref": "15 U.S.C. § 1681",
            "applies_to_states": None,
            "is_blocking": True,
        })
        lending_states = _state_list(target_states, LENDING_LICENSE_STATES)
        if any(s in target_states for s in LENDING_LICENSE_STATES):
            reqs.append({
                "category": RequirementCategory.state_licensing,
                "title": "State Consumer Lending Licenses",
                "description": (
                    f"Obtain consumer lending licenses in: {lending_states}. "
                    f"Requirements include net worth minimums, surety bonds, and background checks."
                ),
                "regulation_ref": "State consumer lending acts (varies by state)",
                "applies_to_states": lending_states,
                "is_blocking": True,
            })
        reqs.append({
            "category": RequirementCategory.consumer_disclosure,
            "title": "State Usury / Rate Cap Compliance",
            "description": (
                "Confirm APR (including all fees) does not exceed state usury caps. "
                "Several states cap consumer loans at 36% APR. Military Lending Act caps "
                "loans to active-duty servicemembers at 36% MAPR."
            ),
            "regulation_ref": "State usury statutes; 10 U.S.C. § 987 (MLA)",
            "applies_to_states": ", ".join(sorted(target_states)),
            "is_blocking": True,
        })
        if customer_segment in (CustomerSegment.consumer,):
            reqs.append({
                "category": RequirementCategory.federal_regulation,
                "title": "Military Lending Act (MLA) Compliance",
                "description": (
                    "Loans to active-duty servicemembers and their dependents are capped at "
                    "36% MAPR. Prohibited practices include mandatory arbitration and prepayment "
                    "penalties. Screen borrowers against MLA database before consummation."
                ),
                "regulation_ref": "10 U.S.C. § 987; 32 CFR Part 232",
                "applies_to_states": None,
                "is_blocking": True,
            })

    # ── PAYMENT APP ───────────────────────────────────────────────────────
    elif product_type == ProductType.payment_app:
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "EFTA / Reg E — Electronic Fund Transfers",
            "description": (
                "Provide initial disclosures of terms and conditions. Limit consumer liability "
                "for unauthorized transfers. Establish error resolution procedures with 45-day "
                "investigation window. Provide transaction receipts."
            ),
            "regulation_ref": "15 U.S.C. § 1693; 12 CFR Part 1005",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.aml_bsa,
            "title": "FinCEN MSB Registration",
            "description": (
                "Payment apps that transfer funds between users must register with FinCEN "
                "as money transmitters. Peer-to-peer payment functionality requires MSB registration."
            ),
            "regulation_ref": "31 CFR § 1022.380",
            "applies_to_states": None,
            "is_blocking": True,
        })
        mt_states = _state_list(target_states, MONEY_TRANSMITTER_LICENSE_STATES)
        reqs.append({
            "category": RequirementCategory.state_licensing,
            "title": "State Money Transmitter Licenses",
            "description": (
                f"Obtain money transmitter licenses in: {mt_states}."
            ),
            "regulation_ref": "State money transmission acts",
            "applies_to_states": mt_states,
            "is_blocking": True,
        })

    # ── SAVINGS / DEPOSIT ─────────────────────────────────────────────────
    elif product_type == ProductType.savings_deposit:
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Bank Charter or Banking-as-a-Service (BaaS) Partner Agreement",
            "description": (
                "Non-bank fintechs may not accept FDIC-insured deposits without a bank charter "
                "or a formal BaaS partner agreement with an FDIC-insured bank. Confirm the "
                "legal structure and program agreement are in place."
            ),
            "regulation_ref": "12 U.S.C. § 1813 (FDI Act)",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.consumer_disclosure,
            "title": "FDIC Insurance Disclosure",
            "description": (
                "Clearly disclose FDIC insurance status and limits ($250,000 per depositor). "
                "If pass-through insurance applies, disclose conditions. Do not misrepresent "
                "insurance status — subject to FDIC Part 328 rules."
            ),
            "regulation_ref": "12 CFR Part 328; FDIC FIL-56-2023",
            "applies_to_states": None,
            "is_blocking": True,
        })
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Reg D — Reserve Requirements / Savings Account Limitations",
            "description": (
                "Savings accounts were historically limited to 6 convenient transfers/month "
                "under Reg D. While the Fed suspended this limit in 2020, review whether "
                "bank partner still enforces transaction limits contractually."
            ),
            "regulation_ref": "12 CFR Part 204",
            "applies_to_states": None,
            "is_blocking": False,
        })

    # ── FEATURE-BASED ADDITIONS ───────────────────────────────────────────
    if has("credit") or has("lending") or has("loan"):
        reqs.append({
            "category": RequirementCategory.federal_regulation,
            "title": "Fair Debt Collection Practices Act (FDCPA) — Collections",
            "description": (
                "If the product involves consumer credit with collections activity, "
                "ensure collections practices comply with FDCPA. Applies to third-party "
                "collectors; first-party collectors are subject to CFPB UDAAP."
            ),
            "regulation_ref": "15 U.S.C. § 1692",
            "applies_to_states": None,
            "is_blocking": False,
        })

    if has("biometric") or has("face") or has("fingerprint"):
        reqs.append({
            "category": RequirementCategory.data_privacy,
            "title": "Biometric Data Privacy Compliance",
            "description": (
                "Illinois BIPA requires written consent and retention/destruction policy for "
                "biometric identifiers. Texas and Washington have similar laws. "
                "Audit all biometric data flows before launch."
            ),
            "regulation_ref": "740 ILCS 14 (BIPA); Tex. Bus. & Com. Code § 503.001",
            "applies_to_states": "IL, TX, WA",
            "is_blocking": True,
        })

    if any(s in target_states for s in ["CA"]):
        reqs.append({
            "category": RequirementCategory.data_privacy,
            "title": "California Consumer Privacy Act (CCPA / CPRA)",
            "description": (
                "For California consumers: provide privacy notice at collection, honor opt-out "
                "of sale/sharing of personal information, respond to consumer rights requests "
                "within 45 days. CPRA amendments effective January 1, 2023."
            ),
            "regulation_ref": "Cal. Civ. Code § 1798.100 et seq.",
            "applies_to_states": "CA",
            "is_blocking": True,
        })

    return reqs


def compute_risk_score(
    product_type: ProductType,
    customer_segment: CustomerSegment,
    target_states: list[str],
    key_features: list[str],
    requirements: list[dict]
) -> tuple[float, RiskLevel]:
    """Compute a 0-100 risk score and risk level for the product launch."""
    score = 0.0
    features_lower = [f.lower() for f in key_features]

    # Product type base risk
    type_scores = {
        ProductType.bnpl: 55,
        ProductType.crypto_exchange: 85,
        ProductType.prepaid_card: 45,
        ProductType.money_transfer: 70,
        ProductType.foreign_remittance: 80,
        ProductType.personal_lending: 50,
        ProductType.payment_app: 60,
        ProductType.savings_deposit: 40,
    }
    score += type_scores.get(product_type, 50) * 0.40

    # State footprint risk (more states = more licensing complexity)
    state_count = len(target_states)
    if state_count >= 40:
        state_score = 90
    elif state_count >= 20:
        state_score = 70
    elif state_count >= 10:
        state_score = 50
    elif state_count >= 5:
        state_score = 35
    else:
        state_score = 20
    score += state_score * 0.25

    # Requirement volume risk
    blocking = sum(1 for r in requirements if r.get("is_blocking"))
    req_score = min(100, blocking * 12)
    score += req_score * 0.20

    # Feature risk
    feature_score = 0
    if any("crypto" in f or "bitcoin" in f for f in features_lower):
        feature_score += 30
    if any("credit" in f or "lending" in f for f in features_lower):
        feature_score += 20
    if any("international" in f or "cross-border" in f for f in features_lower):
        feature_score += 25
    if any("biometric" in f for f in features_lower):
        feature_score += 15
    score += min(100, feature_score) * 0.15

    score = round(min(100.0, score), 1)

    if score >= 75:
        level = RiskLevel.critical
    elif score >= 55:
        level = RiskLevel.high
    elif score >= 35:
        level = RiskLevel.medium
    else:
        level = RiskLevel.low

    return score, level
