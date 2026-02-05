# TRAINING_PROGRAM.md
# TOTALFISC - Training & Certification Program

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Purpose:** Training curriculum for users and partners  

---

## Table of Contents

1. [Training Overview](#training-overview)
2. [User Training](#user-training)
3. [Administrator Training](#administrator-training)
4. [Partner Certification](#partner-certification)
5. [Training Materials](#training-materials)

---

## Training Overview

### Training Tracks

```
┌─────────────────────────────────────────────────────────────┐
│                  TRAINING PROGRAM STRUCTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TRACK 1: End User Training                                 │
│  ├─ Level 1: Basic User (2 hours)                          │
│  ├─ Level 2: Power User (4 hours)                          │
│  └─ Level 3: Expert User (8 hours)                         │
│                                                              │
│  TRACK 2: Administrator Training                            │
│  ├─ Installation & Setup (2 hours)                         │
│  ├─ User Management (2 hours)                              │
│  └─ Maintenance & Troubleshooting (4 hours)                │
│                                                              │
│  TRACK 3: Partner Certification                             │
│  ├─ Reseller Certification (8 hours)                       │
│  ├─ Implementation Partner (16 hours)                      │
│  └─ Support Partner (16 hours)                             │
│                                                              │
│  TRACK 4: Developer Training                                │
│  ├─ API Integration (4 hours)                              │
│  └─ Custom Development (8 hours)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## User Training

### Level 1: Basic User (2 hours)

**Target Audience:** Accountants, bookkeepers  
**Prerequisites:** None  
**Certificate:** TOTALFISC Basic User

#### Module 1: Introduction (30 min)

**Topics:**
- What is TOTALFISC?
- Key features and benefits
- Navigation and user interface
- Basic concepts (fiscal year, journal, entry)

**Hands-On:**
- Login to application
- Navigate through main menus
- View dashboard
- Change language (AR/FR/EN)

**Quiz (5 questions):**
1. What are the 3 main modules in TOTALFISC?
2. How do you access the dashboard?
3. What is a fiscal year?
4. How do you change your password?
5. Where do you find help resources?

---

#### Module 2: Chart of Accounts (30 min)

**Topics:**
- SCF account structure (Classes 1-7)
- Viewing accounts
- Searching accounts
- Understanding account details

**Hands-On:**
- Browse chart of accounts
- Search for specific account (e.g., "512 - Banque")
- View account details
- Understand account classification

**Quiz (5 questions):**
1. What does Class 7 represent?
2. How do you find the bank account?
3. What is the difference between debit and credit accounts?
4. Can you delete an account used in entries?
5. How do you filter accounts by class?

---

#### Module 3: Journal Entries (45 min)

**Topics:**
- Creating journal entries
- Adding lines to entries
- Ensuring entries are balanced
- Posting entries
- Viewing entry history

**Hands-On Exercise:**

**Scenario:** Record a sale of 100,000 DZD (+ 19% VAT = 119,000 DZD)

```
Steps:
1. Click "New Entry" button
2. Set entry date: Today
3. Select journal: VTE (Ventes/Sales)
4. Enter reference: FAC-001
5. Enter description: "Vente marchandises Client ABC"
6. Add lines:
   - Line 1: Account 411, Debit 119,000 DZD
   - Line 2: Account 700, Credit 100,000 DZD
   - Line 3: Account 4457, Credit 19,000 DZD
7. Verify balance (Debit = Credit)
8. Save and Post entry
```

**Quiz (5 questions):**
1. What happens if an entry is unbalanced?
2. Can you edit a posted entry?
3. How do you void an entry?
4. What is the difference between Draft and Posted status?
5. How do you print an entry?

---

#### Module 4: Basic Reports (15 min)

**Topics:**
- Generating trial balance
- Viewing general ledger
- Exporting to Excel/PDF

**Hands-On:**
- Generate trial balance for current fiscal year
- Filter general ledger by account
- Export trial balance to Excel

**Quiz (3 questions):**
1. What does the trial balance show?
2. How do you export a report to PDF?
3. Can you generate reports for closed fiscal years?

---

### Level 2: Power User (4 hours)

**Target Audience:** Senior accountants  
**Prerequisites:** Level 1 certificate  
**Certificate:** TOTALFISC Power User

#### Additional Topics:
- Third party management (clients, suppliers)
- Advanced journal entries (multi-currency, VAT)
- Financial statements (balance sheet, income statement)
- Tax reports (G50, TAP, IBS)
- Fiscal year management (opening, closing)
- Opening balances (À-nouveaux)
- Batch operations
- Custom reports

**Duration:** 4 hours (8 modules × 30 min)

---

### Level 3: Expert User (8 hours)

**Target Audience:** CFOs, expert accountants  
**Prerequisites:** Level 2 certificate  
**Certificate:** TOTALFISC Expert User

#### Additional Topics:
- Multi-company accounting
- Consolidation
- Advanced reporting and analytics
- Data import/export
- Integration with other systems
- Regulatory compliance (SCF, Decree 09-110)
- Year-end procedures
- Audit trail analysis

**Duration:** 8 hours (Full day training)

---

## Administrator Training

### Module 1: Installation & Setup (2 hours)

**Topics:**
- System requirements
- Installation procedure
- License activation
- Initial configuration
- Company setup
- Fiscal year creation

**Hands-On:**
- Install TOTALFISC on test machine
- Activate license
- Configure company information
- Create first fiscal year

---

### Module 2: User Management (2 hours)

**Topics:**
- Creating users
- Assigning roles (Admin, Accountant, Viewer)
- Setting permissions
- Password policies
- Managing user sessions

**Hands-On:**
- Create 3 users with different roles
- Test permissions
- Reset user password
- Lock/unlock accounts

---

### Module 3: Maintenance & Troubleshooting (4 hours)

**Topics:**
- Backup and restore procedures
- Database maintenance
- Performance optimization
- Troubleshooting common issues
- Update procedures
- Security best practices

**Hands-On:**
- Create manual backup
- Restore from backup
- Run database optimization
- Diagnose slow performance
- Apply software update

---

## Partner Certification

### Reseller Certification (8 hours)

**Target Audience:** Sales partners  
**Prerequisites:** None  
**Certificate:** Certified TOTALFISC Reseller

**Curriculum:**

#### Day 1 (4 hours)

**Module 1: Product Overview (1 hour)**
- Product features and benefits
- Competitive advantages
- Pricing and licensing
- Target market

**Module 2: Sales Process (1 hour)**
- Qualifying prospects
- Demo techniques
- Handling objections
- Closing deals

**Module 3: Licensing & Contracts (1 hour)**
- License types (Starter, Professional, Enterprise)
- Pricing calculator
- Contract terms
- Renewal process

**Module 4: Partner Portal (1 hour)**
- Accessing partner portal
- Creating quotes
- Managing customers
- Tracking commissions

#### Day 2 (4 hours)

**Module 5: Product Demo (2 hours)**
- Standard demo script
- Customizing demos for different industries
- Handling technical questions
- Trial setup

**Module 6: Customer Onboarding (1 hour)**
- Installation assistance
- Initial training
- Escalation procedures

**Module 7: Sales Tools & Resources (1 hour)**
- Marketing materials
- Case studies
- ROI calculator
- Competitive battlecards

**Final Exam (60 min):**
- 50 multiple choice questions
- 80% pass score
- Certificate upon passing

---

### Implementation Partner Certification (16 hours)

**Target Audience:** Technical consultants, IT service providers  
**Prerequisites:** Reseller certification  
**Certificate:** Certified TOTALFISC Implementation Partner

**Curriculum:** (2 days, 8 hours each)

**Day 1: Technical Foundation**
- Architecture deep dive
- Database structure
- API overview
- Security model
- Migration from PCCOMPTA

**Day 2: Implementation Best Practices**
- Implementation methodology
- Data migration procedures
- Customization options
- Integration techniques
- Go-live checklist

**Capstone Project:**
Perform complete implementation for fictional company, including:
- Data migration
- User training
- Go-live support

---

### Support Partner Certification (16 hours)

**Target Audience:** IT support teams  
**Prerequisites:** Administrator training  
**Certificate:** Certified TOTALFISC Support Partner

**Curriculum:** (2 days, 8 hours each)

**Day 1: Technical Support**
- Common issues and resolutions
- Advanced troubleshooting
- Database recovery
- Performance tuning
- Remote support tools

**Day 2: Customer Support**
- Support ticket management
- Customer communication
- Escalation procedures
- Knowledge base management
- SLA compliance

**Final Exam:**
- Practical troubleshooting scenarios
- 80% pass score required

---

## Training Materials

### Self-Paced E-Learning

**Platform:** Moodle-based LMS at learn.totalfisc.dz

**Available Courses:**

| Course | Duration | Format | Price |
|--------|----------|--------|-------|
| **Basic User** | 2 hours | Video + Quiz | 5,000 DZD |
| **Power User** | 4 hours | Video + Quiz | 10,000 DZD |
| **Expert User** | 8 hours | Video + Quiz | 20,000 DZD |
| **Administrator** | 8 hours | Video + Hands-on | 25,000 DZD |
| **Reseller** | 8 hours | Video + Exam | Free (partners) |
| **Implementation** | 16 hours | Video + Project | 50,000 DZD |

---

### Instructor-Led Training

**Delivery Methods:**
- On-site (customer location)
- Public classes (Algiers, Oran, Constantine)
- Virtual classrooms (Zoom)

**Schedule:**
- Monthly public classes in major cities
- Custom on-site training upon request

**Pricing:**

| Type | Participants | Price |
|------|--------------|-------|
| **Public Class** | Individual | 15,000 DZD/person |
| **On-Site (Half Day)** | Up to 10 | 100,000 DZD |
| **On-Site (Full Day)** | Up to 10 | 180,000 DZD |
| **Virtual Classroom** | Up to 20 | 50,000 DZD/session |

---

### Training Documentation

**User Manual:** 150 pages, PDF, available in AR/FR/EN  
**Quick Reference Card:** 2-page laminated card  
**Video Tutorials:** 50+ videos on YouTube (free)  
**Knowledge Base:** 200+ articles on support portal  

---

### Certification Badges

Upon completing each level, users receive:

✅ **Digital Badge** - LinkedIn-ready, shareable  
✅ **Certificate PDF** - Downloadable from learning portal  
✅ **Wallet Card** - Physical card mailed to user  

**Badge Levels:**

🥉 **Bronze:** Basic User  
🥈 **Silver:** Power User  
🥇 **Gold:** Expert User  
💎 **Platinum:** Administrator + Implementation Partner  

---

## Training Calendar 2026

| Month | Location | Course | Dates |
|-------|----------|--------|-------|
| **February** | Algiers | Basic User | Feb 15 |
| **February** | Online | Administrator | Feb 22-23 |
| **March** | Oran | Power User | Mar 8 |
| **March** | Algiers | Reseller Cert | Mar 15-16 |
| **April** | Constantine | Basic User | Apr 5 |
| **April** | Online | Implementation | Apr 19-20 |
| **May** | Algiers | Expert User | May 10 |
| **May** | Online | Support Partner | May 24-25 |

**Registration:** training@totalfisc.dz

---

## Conclusion

Comprehensive training ensures:

✅ **User Adoption** - Users confident in using the software  
✅ **Reduced Support** - Self-sufficient users = fewer tickets  
✅ **Partner Ecosystem** - Certified partners expand our reach  
✅ **Customer Success** - Trained users = successful customers  

**Invest in training for long-term success!**

---

**Related Documents:**
- [USER_GUIDE.md](USER_GUIDE.md) - User reference
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) - Problem solving
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - For implementation partners
