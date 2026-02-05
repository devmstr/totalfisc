# PROJECT_ROADMAP.md
# TOTALFISC - Project Roadmap

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Timeline:** 18 months (MVP to Production)  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Phases](#development-phases)
3. [Sprint Planning](#sprint-planning)
4. [Resource Allocation](#resource-allocation)
5. [Risk Management](#risk-management)
6. [Milestones & Deliverables](#milestones--deliverables)
7. [Success Metrics](#success-metrics)

---

## Project Overview

### Vision

Build **TOTALFISC**: A modern, compliant, tamper-proof accounting software for Algerian businesses, replacing legacy systems like PCCOMPTA.

### Objectives

| Objective | Target | Timeline |
|-----------|--------|----------|
| **MVP Launch** | 10 pilot customers | Month 6 |
| **v1.0 Release** | Full SCF compliance | Month 12 |
| **Market Penetration** | 100 customers | Month 18 |
| **Break-Even** | Revenue = Costs | Month 24 |

### Success Criteria

✅ **Technical:**
- 100% SCF compliance
- Decree 09-110 tamper-proof ledger
- <100ms API response time
- 99.9% uptime

✅ **Business:**
- 100 paying customers in Year 1
- 95% customer satisfaction
- <5% churn rate
- Positive cash flow by Month 24

✅ **Market:**
- #1 modern accounting software in Algeria
- Partnership with 3+ accounting firms
- Featured in local business media

---

## Development Phases

### Phase 1: Foundation (Months 1-3)

**Goal:** Core infrastructure and domain model

#### Month 1: Setup & Architecture
```
Week 1-2: Project Setup
├─ Development environment
├─ Git repository structure
├─ CI/CD pipeline
├─ Team onboarding
└─ Architecture documentation

Week 3-4: Domain Model
├─ Aggregate design
├─ Entity definitions
├─ Value objects
└─ Domain events
```

**Deliverables:**
- ✅ Development environment ready
- ✅ Domain model implemented
- ✅ Unit tests (>80% coverage)

#### Month 2: Database & Backend
```
Week 1-2: Database
├─ SQLite schema
├─ Migrations
├─ Indexes
└─ Test data seeding

Week 3-4: Backend API
├─ ASP.NET Core setup
├─ MediatR integration
├─ Basic CRUD operations
└─ API tests
```

**Deliverables:**
- ✅ Database schema complete
- ✅ REST API operational
- ✅ Swagger documentation

#### Month 3: Authentication & Security
```
Week 1-2: Authentication
├─ JWT implementation
├─ BCrypt password hashing
├─ Login/logout flow
└─ Token refresh

Week 3-4: Authorization & Security
├─ RBAC system
├─ Permission checking
├─ SQLCipher encryption
└─ Security testing
```

**Deliverables:**
- ✅ Secure authentication system
- ✅ Role-based access control
- ✅ Encrypted database

---

### Phase 2: Core Features (Months 4-6)

**Goal:** Essential accounting functionality

#### Month 4: Chart of Accounts & Journal Entries
```
Week 1-2: Chart of Accounts
├─ Account CRUD
├─ SCF structure (Classes 1-7)
├─ Account validation
└─ Import/export

Week 3-4: Journal Entries
├─ Entry creation
├─ Line management
├─ Balance validation
└─ Draft/Post workflow
```

**Deliverables:**
- ✅ Complete chart of accounts
- ✅ Journal entry system
- ✅ Balanced entry validation

#### Month 5: Third Parties & Hash Chain
```
Week 1-2: Third Parties
├─ Client/Supplier CRUD
├─ NIF/NIS/RC validation
├─ Contact management
└─ Search/filter

Week 3-4: Tamper-Proof Ledger
├─ SHA-256 hash chain
├─ Previous hash linking
├─ Integrity verification
└─ Decree 09-110 compliance
```

**Deliverables:**
- ✅ Third party management
- ✅ Tamper-proof ledger
- ✅ Audit trail

#### Month 6: Reports & MVP Launch
```
Week 1-2: Basic Reports
├─ Trial balance
├─ General ledger
├─ Account statement
└─ PDF export

Week 3-4: MVP Testing & Launch
├─ End-to-end testing
├─ User acceptance testing
├─ Bug fixes
└─ Pilot deployment
```

**Deliverables:**
- ✅ Essential reports
- ✅ MVP deployed to 10 pilot customers
- ✅ Feedback collection process

---

### Phase 3: Advanced Features (Months 7-9)

**Goal:** Complete accounting suite

#### Month 7: Financial Statements
```
Week 1-2: Balance Sheet & Income Statement
├─ Balance sheet (Bilan)
├─ Income statement (Compte de résultat)
├─ SCF format compliance
└─ Comparative reports

Week 3-4: Cash Flow & Notes
├─ Cash flow statement
├─ Notes (Annexes)
├─ Ratio calculations
└─ Multi-period comparison
```

**Deliverables:**
- ✅ Complete financial statements
- ✅ SCF-compliant formats

#### Month 8: Fiscal Year Management
```
Week 1-2: Fiscal Year Operations
├─ Year creation/opening
├─ Opening balances (À-nouveaux)
├─ Year-end closing
└─ Result transfer

Week 3-4: Multi-Year Support
├─ Cross-year queries
├─ Comparative analysis
├─ Archive old years
└─ Year reopening
```

**Deliverables:**
- ✅ Full fiscal year lifecycle
- ✅ Multi-year reporting

#### Month 9: Tax Reports
```
Week 1-2: VAT Reports
├─ G50 declaration
├─ VAT calculation
├─ Tax codes management
└─ Monthly/quarterly filing

Week 3-4: Other Tax Reports
├─ TAP (2% turnover tax)
├─ IBS (corporate tax)
├─ Withholding tax
└─ Social security declarations
```

**Deliverables:**
- ✅ Algerian tax reports
- ✅ Automated calculations

---

### Phase 4: Desktop Application (Months 10-12)

**Goal:** Professional desktop UI with WebView2

#### Month 10: Desktop Shell
```
Week 1-2: WPF Application
├─ Window management
├─ WebView2 integration
├─ Navigation system
└─ Menu/toolbar

Week 3-4: Local Server Integration
├─ Embedded Kestrel server
├─ API communication
├─ State management
└─ Error handling
```

**Deliverables:**
- ✅ Desktop application shell
- ✅ WebView2 frontend integration

#### Month 11: Frontend (React + TanStack Query)
```
Week 1-2: Core UI Components
├─ Dashboard
├─ Journal entry form
├─ Account list/form
├─ Third party management
└─ shadcn/ui components

Week 3-4: Advanced UI
├─ Report viewer
├─ Data tables (virtualization)
├─ Search/filters
└─ Export functionality
```

**Deliverables:**
- ✅ Complete React frontend
- ✅ Professional UI/UX

#### Month 12: Polish & v1.0 Release
```
Week 1-2: Quality Assurance
├─ Bug fixes
├─ Performance optimization
├─ Accessibility
└─ Localization (AR/FR)

Week 3-4: Release Preparation
├─ User documentation
├─ Installation package
├─ Marketing materials
└─ Launch event
```

**Deliverables:**
- ✅ **TOTALFISC v1.0** 🎉
- ✅ Complete documentation
- ✅ MSI installer

---

### Phase 5: Growth & Scale (Months 13-18)

**Goal:** Market expansion and advanced features

#### Months 13-15: Market Expansion
```
Marketing & Sales:
├─ Sales team training
├─ Partner program (accounting firms)
├─ Customer success program
├─ Referral incentives
└─ Content marketing

Feature Enhancements:
├─ Import from PCCOMPTA
├─ Bulk operations
├─ Custom reports builder
├─ Advanced search
└─ Keyboard shortcuts
```

**Deliverables:**
- ✅ 50+ customers
- ✅ Partner network established
- ✅ Enhanced features based on feedback

#### Months 16-18: Enterprise Features
```
Enterprise Capabilities:
├─ Multi-company management
├─ Consolidation
├─ Advanced RBAC (custom roles)
├─ Audit logs viewer
└─ API for integrations

Cloud Preparation:
├─ Multi-tenant architecture
├─ Cloud deployment (AWS/Azure)
├─ Subscription billing
├─ Automatic updates
└─ Remote support
```

**Deliverables:**
- ✅ 100+ customers
- ✅ Enterprise edition
- ✅ Cloud-ready architecture

---

## Sprint Planning

### Sprint Structure

**Duration:** 2 weeks per sprint  
**Ceremonies:**
- Sprint Planning (Monday, Week 1)
- Daily Standup (Every day, 15 min)
- Sprint Review (Friday, Week 2)
- Sprint Retrospective (Friday, Week 2)

### Example Sprint (Month 4, Sprint 1)

```
Sprint Goal: Implement Journal Entry creation

User Stories:
├─ US-101: As an accountant, I can create a journal entry
├─ US-102: As an accountant, I can add/remove lines to an entry
├─ US-103: As an accountant, I see balance validation
├─ US-104: As an accountant, I can save as draft or post
└─ US-105: As an accountant, I see validation errors

Story Points: 21
Velocity Target: 20-25 points/sprint

Daily Tasks:
Day 1: API endpoint design
Day 2-3: Create entry command handler
Day 4-5: Line management logic
Day 6-7: Balance validation
Day 8-9: Frontend form
Day 10: Testing & bug fixes
```

---

## Resource Allocation

### Team Structure

#### Core Team (Months 1-12)

| Role | FTE | Months | Responsibilities |
|------|-----|--------|------------------|
| **Product Manager** | 0.5 | 1-18 | Vision, roadmap, priorities |
| **Tech Lead / Architect** | 1.0 | 1-18 | Architecture, code review |
| **Backend Developer** | 2.0 | 1-12 | API, database, domain logic |
| **Frontend Developer** | 1.0 | 4-12 | React, UI/UX |
| **QA Engineer** | 0.5 | 6-18 | Testing, automation |
| **DevOps Engineer** | 0.3 | 1-18 | CI/CD, deployment |
| **UX Designer** | 0.5 | 3-9 | UI design, user research |

**Total:** ~5.5 FTE for 12 months

#### Extended Team (Months 13-18)

| Role | FTE | Months | Responsibilities |
|------|-----|--------|------------------|
| **Sales Manager** | 1.0 | 13-18 | Customer acquisition |
| **Customer Success** | 0.5 | 13-18 | Onboarding, support |
| **Marketing** | 0.5 | 13-18 | Content, campaigns |
| **Additional Developers** | 1.0 | 13-18 | New features |

**Total:** ~3.0 additional FTE

---

## Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Performance issues** | Medium | High | Early profiling, optimization sprints |
| **Database corruption** | Low | Critical | Automatic backups, integrity checks |
| **Security breach** | Low | Critical | Security audits, penetration testing |
| **Hash chain breaks** | Low | Critical | Rigorous testing, validation |
| **WebView2 compatibility** | Medium | Medium | Fallback to system browser |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low adoption** | Medium | High | Pilot program, user feedback loops |
| **Competition** | High | Medium | Unique features (tamper-proof, modern UI) |
| **Regulatory changes** | Medium | High | Monitor SCF updates, flexible design |
| **Key person departure** | Medium | High | Documentation, knowledge sharing |
| **Budget overrun** | Medium | High | Monthly budget reviews, contingency fund |

### Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Customer reluctance to switch** | High | High | Migration tools, training, support |
| **Pricing resistance** | Medium | Medium | Flexible pricing, freemium model |
| **Lack of integrations** | Medium | Medium | API-first design, partner ecosystem |

---

## Milestones & Deliverables

### Major Milestones

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT TIMELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Month 0  ━━ Project Kickoff                                │
│           └─► Team assembled, documentation complete        │
│                                                              │
│  Month 3  ━━ Foundation Complete                            │
│           └─► Database, API, authentication ready           │
│                                                              │
│  Month 6  ━━ MVP Launch 🎯                                  │
│           └─► 10 pilot customers, core features            │
│                                                              │
│  Month 9  ━━ Advanced Features Complete                     │
│           └─► Financial statements, tax reports            │
│                                                              │
│  Month 12 ━━ v1.0 Production Release 🎉                     │
│           └─► Full product, desktop app, installer         │
│                                                              │
│  Month 18 ━━ Market Leader 🚀                               │
│           └─► 100+ customers, enterprise features          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Deliverables by Phase

#### Phase 1 Deliverables (Month 3)
- ✅ Source code repository
- ✅ Database schema
- ✅ REST API (basic CRUD)
- ✅ Authentication system
- ✅ Technical documentation

#### Phase 2 Deliverables (Month 6)
- ✅ Journal entry system
- ✅ Chart of accounts
- ✅ Third party management
- ✅ Basic reports
- ✅ MVP installer

#### Phase 3 Deliverables (Month 9)
- ✅ Financial statements
- ✅ Tax reports
- ✅ Fiscal year management
- ✅ Multi-year support

#### Phase 4 Deliverables (Month 12)
- ✅ Desktop application
- ✅ React frontend
- ✅ Professional UI/UX
- ✅ MSI installer
- ✅ User documentation

#### Phase 5 Deliverables (Month 18)
- ✅ 100+ customers
- ✅ Enterprise features
- ✅ Partner network
- ✅ Cloud-ready architecture

---

## Success Metrics

### Development Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| **Velocity** | 20-25 pts/sprint | Jira burndown |
| **Code Coverage** | >80% | Automated tests |
| **Bug Density** | <5 bugs/KLOC | SonarQube |
| **API Response Time** | <100ms (P95) | Application Insights |
| **Build Success Rate** | >95% | Azure DevOps |

### Business Metrics

| Metric | Month 6 | Month 12 | Month 18 |
|--------|---------|----------|----------|
| **Customers** | 10 | 30 | 100 |
| **MRR** | 5K DZD | 50K DZD | 200K DZD |
| **Churn Rate** | N/A | <5% | <5% |
| **NPS Score** | 40+ | 50+ | 60+ |
| **Support Tickets** | <10/month | <30/month | <100/month |

### Product Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| **Daily Active Users** | 70% of customers | Analytics |
| **Avg. Session Duration** | >30 min | Analytics |
| **Feature Adoption** | >50% use new features | Feature flags |
| **Error Rate** | <1% of requests | Error monitoring |
| **Uptime** | 99.9% | Status page |

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| **.NET** | 9.0 | Backend runtime | Low (stable) |
| **React** | 18+ | Frontend | Low (mature) |
| **SQLite** | 3.45+ | Database | Low (stable) |
| **WebView2** | Latest | Desktop UI | Medium (MS maintained) |

### Internal Dependencies

```
Critical Path:
Domain Model → Database Schema → API → Frontend → Desktop App

Parallel Tracks:
├─ Security (can develop alongside core features)
├─ Reports (depends on data model)
└─ Tax compliance (depends on core accounting)
```

---

## Budget Estimate

### Development Costs (12 months)

| Category | Monthly | Total (12m) |
|----------|---------|-------------|
| **Salaries** (5.5 FTE) | 30M DZD | 360M DZD |
| **Infrastructure** | 1M DZD | 12M DZD |
| **Tools & Licenses** | 0.5M DZD | 6M DZD |
| **Marketing** | 2M DZD | 24M DZD |
| **Office & Misc** | 1.5M DZD | 18M DZD |
| **Contingency (20%)** | - | 84M DZD |
| **TOTAL** | - | **504M DZD** |

### Revenue Projection (18 months)

| Month | Customers | MRR | Total Revenue |
|-------|-----------|-----|---------------|
| **6** | 10 | 5M | 5M DZD |
| **12** | 30 | 50M | 350M DZD |
| **18** | 100 | 200M | 1,550M DZD |

**Break-even:** Month 20-22 (projected)

---

## Conclusion

This roadmap provides a clear path from concept to market leader in 18 months. Success depends on:

✅ **Disciplined execution** - Follow sprint cadence  
✅ **User feedback** - Iterate based on pilot customers  
✅ **Technical excellence** - Maintain quality standards  
✅ **Market focus** - Solve real problems for Algerian businesses  

**Let's build the future of accounting in Algeria!** 🇩🇿🚀

---

**Related Documents:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical foundation
- [BUSINESS_CASE.md](BUSINESS_CASE.md) - Financial analysis
- [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) - Market positioning
