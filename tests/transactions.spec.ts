import { execSync } from 'node:child_process'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('test', () => {
  beforeAll(async () => {
    app.ready()
  })
  afterAll(async () => {
    app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(() => {
    execSync('npm run knex migrate:rollback --all')
  })
  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'teste',
        amount: 20,
        type: 'debit',
      })
      .expect(201)
  })
  it('should be able to list transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'teste',
        amount: 20,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(transactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'teste',
        amount: 20,
      }),
    ])
  })
  it('should be able to get transaction by id', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'teste',
        amount: 20,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionID = transactionsResponse.body.transactions[0].id
    const transactionByIdResponse = await request(app.server)
      .get(`/transactions/${transactionID}`)
      .set('Cookie', cookies)

    expect(transactionByIdResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'teste',
        amount: 20,
        id: transactionID,
      }),
    )
  })

  it('should be able to show summary', async () => {
    const createDebitTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'teste',
        amount: 200,
        type: 'credit',
      })

    const cookies = createDebitTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'teste',
        amount: 100,
        type: 'debit',
      })
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.body.summary).toEqual({
      amount: 100,
    })
  })
})
