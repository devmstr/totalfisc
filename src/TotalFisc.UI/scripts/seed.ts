import { faker } from '@faker-js/faker'
import axios from 'axios'

const API_URL = 'http://localhost:5015/api' // Corrected port from Linux guide

async function seed() {
  console.log('🌱 Seeding real data...')

  try {
    // 1. Get or Create Fiscal Year (simplified for seed)
    const fiscalYearId = faker.string.uuid()

    // 2. Seed Accounts
    console.log('  -> Seeding accounts...')
    for (let i = 0; i < 20; i++) {
      await axios.post(`${API_URL}/accounts`, {
        accountNumber: faker.finance.accountNumber(5),
        label: faker.finance.accountName(),
        isSummary: false,
        isAuxiliary: false
      })
    }

    // 3. Seed Journal Entries
    console.log('  -> Seeding journal entries...')
    for (let i = 0; i < 50; i++) {
      await axios.post(`${API_URL}/journalentries`, {
        fiscalYearId: fiscalYearId,
        description: faker.finance.transactionDescription(),
        entryDate: faker.date.recent().toISOString(),
        journalCode: faker.helpers.arrayElement(['ACH', 'VTE', 'BQ', 'OD']),
        reference: `REF-${faker.string.alphanumeric(5).toUpperCase()}`,
        lines: [
          {
            accountId: faker.string.uuid(), // This would ideally use real IDS from step 2
            label: 'Seeded Debit',
            debit: faker.number.float({
              min: 100,
              max: 1000,
              multipleOf: 0.01
            }),
            credit: 0
          },
          {
            accountId: faker.string.uuid(),
            label: 'Seeded Credit',
            debit: 0,
            credit: faker.number.float({
              min: 100,
              max: 1000,
              multipleOf: 0.01
            })
          }
        ]
      })
    }

    console.log('✅ Seeding complete!')
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.response?.data || error.message)
  }
}

seed()
