"""
Build every Northbound Dispatch PDF into ./output.

Usage:
    pip install -r requirements.txt
    python3 build_all.py
"""

import os
import generate_carrier_agreement as agreement
import generate_rate_confirmation as ratecon
import generate_onboarding_checklist as checklist
import generate_referral_program as referral
import generate_business_card as bizcard

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "output")


def main():
    os.makedirs(OUT, exist_ok=True)
    agreement.build(os.path.join(OUT, "Northbound-Carrier-Dispatcher-Agreement.pdf"))
    ratecon.build(os.path.join(OUT, "Northbound-Rate-Confirmation-Template.pdf"))
    checklist.build(os.path.join(OUT, "Northbound-Carrier-Onboarding-Checklist.pdf"))
    referral.build(os.path.join(OUT, "Northbound-Referral-Program.pdf"))
    bizcard.build(os.path.join(OUT, "Northbound-Business-Card.pdf"))
    print("\nAll documents built into:", OUT)


if __name__ == "__main__":
    main()
