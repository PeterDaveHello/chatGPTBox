import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  canonicalizeApiMode,
  canonicalizeModelKey,
  canonicalizeModelKeyArray,
  canonicalizeSessionModelFields,
  getCanonicalModelKeyGroupName,
} from '../../../src/config/model-key-migrations.mjs'

test('canonicalizeModelKey maps every retired Bing web key', () => {
  const retiredKeys = [
    'bingFree4',
    'bingFree4-balanced',
    'bingFree4-creative',
    'bingFree4-precise',
    'bingFree4-fast',
    'bingFreeSydney',
    'bingFreeSydney-balanced',
    'bingFreeSydney-creative',
    'bingFreeSydney-precise',
    'bingFreeSydney-fast',
  ]

  for (const modelKey of retiredKeys) {
    assert.equal(canonicalizeModelKey(modelKey), 'chatgptFree35', modelKey)
    assert.equal(getCanonicalModelKeyGroupName(modelKey, 'bingWebModelKeys'), 'chatgptWebModelKeys')
  }
})

test('canonicalizeModelKeyArray collapses retired Bing keys and dedupes', () => {
  assert.deepEqual(
    canonicalizeModelKeyArray(['bingFree4', 'bingFreeSydney-fast', 'chatgptFree35']),
    ['chatgptFree35'],
  )
})

test('canonicalizeApiMode drops a retired tone carried in customName', () => {
  const migrated = canonicalizeApiMode({
    groupName: 'bingWebModelKeys',
    itemName: 'bingFree4',
    isCustom: true,
    customName: 'fast',
  })

  assert.deepEqual(migrated, {
    groupName: 'chatgptWebModelKeys',
    itemName: 'chatgptFree35',
    isCustom: false,
    customName: '',
  })
})

test('canonicalizeApiMode drops a retired tone carried in a suffixed itemName', () => {
  const migrated = canonicalizeApiMode({
    groupName: 'bingWebModelKeys',
    itemName: 'bingFreeSydney-creative',
    isCustom: true,
    customName: 'fast',
  })

  assert.equal(migrated.itemName, 'chatgptFree35')
  assert.equal(migrated.groupName, 'chatgptWebModelKeys')
  assert.equal(migrated.customName, '')
  assert.equal(migrated.isCustom, false)
})

test('canonicalizeApiMode keeps custom names for keys that merely look retired', () => {
  const lookalike = canonicalizeApiMode({
    groupName: 'chatgptApiModelKeys',
    itemName: 'bingFree4o',
    isCustom: true,
    customName: 'mine',
  })
  assert.equal(lookalike.customName, 'mine')
  assert.equal(lookalike.isCustom, true)

  const unrelated = canonicalizeApiMode({
    groupName: 'chatgptApiModelKeys',
    itemName: 'chatgptApi4oMini',
    isCustom: true,
    customName: 'mine',
  })
  assert.equal(unrelated.customName, 'mine')
  assert.equal(unrelated.isCustom, true)
})

test('canonicalizeApiMode rewrites a custom row parked under a retired group', () => {
  const migrated = canonicalizeApiMode({
    groupName: 'bingWebModelKeys',
    itemName: 'custom',
    isCustom: true,
    customName: 'my-variant',
    customUrl: 'https://proxy.example/v1/chat/completions',
    apiKey: 'proxy-key',
    providerId: 'proxy',
  })

  assert.deepEqual(migrated, {
    groupName: 'chatgptWebModelKeys',
    itemName: 'chatgptFree35',
    isCustom: false,
    customName: '',
    customUrl: 'https://proxy.example/v1/chat/completions',
    apiKey: 'proxy-key',
    providerId: 'proxy',
  })
})

test('canonicalizeApiMode leaves non-object and unchanged input alone', () => {
  assert.equal(canonicalizeApiMode(null), null)
  assert.equal(canonicalizeApiMode(undefined), undefined)

  const untouched = { groupName: 'chatgptApiModelKeys', itemName: 'chatgptApi4oMini' }
  assert.equal(canonicalizeApiMode(untouched), untouched)
})

test('canonicalizeSessionModelFields renames legacy third party continuation fields', () => {
  const migrated = canonicalizeSessionModelFields({
    modelName: 'waylaidwandererApi',
    bingWeb_encryptedConversationSignature: 'sig-1',
    bingWeb_conversationId: 'conv-1',
    bingWeb_clientId: 'client-1',
    bingWeb_invocationId: 'inv-1',
    conversationId: null,
    parentMessageId: null,
  })

  assert.equal(migrated.thirdPartySignature, 'sig-1')
  assert.equal(migrated.thirdPartyConversationId, 'conv-1')
  assert.equal(migrated.thirdPartyClientId, 'client-1')
  assert.equal(migrated.thirdPartyInvocationId, 'inv-1')
  assert.equal('bingWeb_encryptedConversationSignature' in migrated, false)
  assert.equal('bingWeb_conversationId' in migrated, false)
  assert.equal('bingWeb_clientId' in migrated, false)
  assert.equal('bingWeb_invocationId' in migrated, false)
})

test('canonicalizeSessionModelFields keeps the current field when both are present', () => {
  const migrated = canonicalizeSessionModelFields({
    modelName: 'waylaidwandererApi',
    bingWeb_encryptedConversationSignature: 'legacy-sig',
    thirdPartySignature: 'current-sig',
  })

  assert.equal(migrated.thirdPartySignature, 'current-sig')
  assert.equal('bingWeb_encryptedConversationSignature' in migrated, false)
})

test('canonicalizeSessionModelFields leaves an untouched session identical', () => {
  const session = { modelName: 'chatgptFree35', conversationId: null }
  assert.equal(canonicalizeSessionModelFields(session), session)
})
