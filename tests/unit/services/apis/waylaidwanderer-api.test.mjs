import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateAnswersWithWaylaidwandererApi } from '../../../../src/services/apis/waylaidwanderer-api.mjs'

function createFakePort() {
  const postedMessages = []
  return {
    postedMessages,
    postMessage(message) {
      postedMessages.push(message)
    },
    onMessage: { addListener() {}, removeListener() {} },
    onDisconnect: { addListener() {}, removeListener() {} },
  }
}

function createResponse(payload) {
  return {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload))
        controller.close()
      },
    }),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'text/event-stream' }),
  }
}

async function runTurn(session, requests) {
  const port = createFakePort()
  await generateAnswersWithWaylaidwandererApi(port, 'question', session)
  return requests
}

function createSession(overrides = {}) {
  return {
    conversationId: null,
    parentMessageId: null,
    conversationRecords: [],
    isRetry: false,
    ...overrides,
  }
}

test('Waylaidwanderer echoes back the signature the backend issued', async () => {
  const requests = []
  const previousFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push(JSON.parse(init.body))
    const index = requests.length - 1
    return createResponse(
      index === 0
        ? 'data: {"encryptedConversationSignature":"sig-1","conversationId":"conv-1","clientId":"client-1","invocationId":"inv-1"}\n\ndata: [DONE]\n\n'
        : 'data: [DONE]\n\n',
    )
  }

  try {
    const session = createSession()
    await runTurn(session, requests)
    assert.deepEqual(requests[0], { message: 'question', stream: true })

    await runTurn(session, requests)
    assert.deepEqual(requests[1], {
      message: 'question',
      stream: true,
      conversationId: 'conv-1',
      encryptedConversationSignature: 'sig-1',
      clientId: 'client-1',
      invocationId: 'inv-1',
    })
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('Waylaidwanderer still continues through a parent message id', async () => {
  const requests = []
  const previousFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push(JSON.parse(init.body))
    return createResponse('data: [DONE]\n\n')
  }

  try {
    const session = createSession({ conversationId: 'conv-9', parentMessageId: 'parent-9' })
    await runTurn(session, requests)
    assert.deepEqual(requests[0], {
      message: 'question',
      stream: true,
      conversationId: 'conv-9',
      parentMessageId: 'parent-9',
    })
  } finally {
    globalThis.fetch = previousFetch
  }
})
