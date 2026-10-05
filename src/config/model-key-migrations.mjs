export const LEGACY_MODEL_KEY_MIGRATIONS = {
  chatgptFree4o: 'chatgptFree4oMini',

  bingFree4: 'chatgptFree35',
  'bingFree4-balanced': 'chatgptFree35',
  'bingFree4-creative': 'chatgptFree35',
  'bingFree4-precise': 'chatgptFree35',
  'bingFree4-fast': 'chatgptFree35',
  bingFreeSydney: 'chatgptFree35',
  'bingFreeSydney-balanced': 'chatgptFree35',
  'bingFreeSydney-creative': 'chatgptFree35',
  'bingFreeSydney-precise': 'chatgptFree35',
  'bingFreeSydney-fast': 'chatgptFree35',

  gptApiDavinci: 'gptApiInstruct',

  chatgptApi35: 'chatgptApi4oMini',
  chatgptApi35_16k: 'chatgptApi4oMini',
  chatgptApi35_1106: 'chatgptApi4oMini',
  chatgptApi35_0125: 'chatgptApi4oMini',
  chatgptApi4oLatest: 'chatgptApiChatLatest',
  chatgptApi4_8k: 'chatgptApi4_1',
  chatgptApi4_8k_0613: 'chatgptApi4_1',
  chatgptApi4_32k: 'chatgptApi4o_128k',
  chatgptApi4_32k_0613: 'chatgptApi4o_128k',
  chatgptApi4_128k: 'chatgptApi4o_128k',
  chatgptApi4_128k_preview: 'chatgptApi4o_128k',
  chatgptApi4_128k_1106_preview: 'chatgptApi4o_128k',
  chatgptApi4_128k_0125_preview: 'chatgptApi4o_128k',

  claude12Api: 'claudeHaiku45Api',
  claude2Api: 'claudeSonnet46Api',
  claude21Api: 'claudeSonnet46Api',
  claude3HaikuApi: 'claudeHaiku45Api',
  claude35HaikuApi: 'claudeHaiku45Api',
  claude3SonnetApi: 'claudeSonnet46Api',
  claude35SonnetApi: 'claudeSonnet46Api',
  claude37SonnetApi: 'claudeSonnet46Api',
  claudeSonnet4Api: 'claudeSonnet46Api',
  claude3OpusApi: 'claudeOpus48Api',
  claudeOpus4Api: 'claudeOpus48Api',

  chatglmTurbo: 'chatglm45Air',
  chatglm4: 'chatglm4Long',
  chatglmEmohaa: 'chatglm5',
  chatglmCharGLM3: 'chatglm5',

  moonshot_k2: 'moonshot_k2_5',

  openRouter_anthropic_claude_sonnet4: 'openRouter_anthropic_claude_sonnet4_6',
  openRouter_anthropic_claude_3_7_sonnet: 'openRouter_anthropic_claude_sonnet4_6',
  openRouter_deepseek_deepseek_chat_v3_0324_free: 'openRouter_deepseek_v4_flash',

  aiml_anthropic_claude_opus_4: 'aiml_claude_opus_4_8',
  aiml_anthropic_claude_sonnet_4: 'aiml_claude_sonnet_4_6_20260218',
  aiml_claude_3_7_sonnet_20250219: 'aiml_claude_sonnet_4_6_20260218',
  aiml_google_gemini_2_5_pro_preview_05_06: 'aiml_google_gemini_2_5_pro',
  aiml_google_gemini_2_5_flash_preview: 'aiml_google_gemini_2_5_flash',
  aiml_openai_o3_2025_04_16: 'aiml_openai_gpt_5_5',
  aiml_openai_gpt_4_1_2025_04_14: 'aiml_openai_gpt_5_1',
  aiml_deepseek_deepseek_chat: 'aiml_deepseek_v4_flash',
  aiml_moonshot_kimi_k2_preview: 'aiml_moonshot_kimi_k2_5',
}

const MODEL_KEY_GROUP_OVERRIDES = {
  chatgptFree4oMini: 'chatgptWebModelKeys',
  chatgptFree35: 'chatgptWebModelKeys',

  gptApiInstruct: 'gptApiModelKeys',

  chatgptApi4oMini: 'chatgptApiModelKeys',
  chatgptApiChatLatest: 'chatgptApiModelKeys',
  chatgptApi4_1: 'chatgptApiModelKeys',
  chatgptApi4o_128k: 'chatgptApiModelKeys',

  claudeHaiku45Api: 'claudeApiModelKeys',
  claudeSonnet46Api: 'claudeApiModelKeys',
  claudeOpus48Api: 'claudeApiModelKeys',

  chatglm45Air: 'chatglmApiModelKeys',
  chatglm4Long: 'chatglmApiModelKeys',
  chatglm5: 'chatglmApiModelKeys',

  moonshot_k2_5: 'moonshotApiModelKeys',

  openRouter_anthropic_claude_sonnet4_6: 'openRouterApiModelKeys',
  openRouter_deepseek_v4_flash: 'openRouterApiModelKeys',

  aiml_claude_opus_4_8: 'aimlModelKeys',
  aiml_claude_sonnet_4_6_20260218: 'aimlModelKeys',
  aiml_google_gemini_2_5_pro: 'aimlModelKeys',
  aiml_google_gemini_2_5_flash: 'aimlModelKeys',
  aiml_openai_gpt_5_5: 'aimlModelKeys',
  aiml_openai_gpt_5_1: 'aimlModelKeys',
  aiml_deepseek_v4_flash: 'aimlModelKeys',
  aiml_moonshot_kimi_k2_5: 'aimlModelKeys',
}

function normalizeLegacyGroupName(groupName) {
  return groupName === 'aimlApiModelKeys' ? 'aimlModelKeys' : groupName
}

export function canonicalizeModelKey(modelKey) {
  if (typeof modelKey !== 'string') return modelKey
  return LEGACY_MODEL_KEY_MIGRATIONS[modelKey] || modelKey
}

export function getCanonicalModelKeyGroupName(modelKey, fallbackGroupName = '') {
  const canonicalModelKey = canonicalizeModelKey(modelKey)
  return MODEL_KEY_GROUP_OVERRIDES[canonicalModelKey] || normalizeLegacyGroupName(fallbackGroupName)
}

const RETIRED_MODEL_KEYS = new Set(['bingFree4', 'bingFreeSydney'])

// A custom row keeps its variant in customName and leaves itemName as 'custom',
// so nothing about it matches the model-key table. The retired group is then the
// only remaining signal that the row points at a provider that no longer exists.
const RETIRED_GROUP_TARGETS = new Map([
  ['bingWebModelKeys', { groupName: 'chatgptWebModelKeys', itemName: 'chatgptFree35' }],
])

function getRetiredModelKeyBase(modelKey) {
  const separatorIndex = typeof modelKey === 'string' ? modelKey.indexOf('-') : -1
  const baseKey = separatorIndex === -1 ? modelKey : modelKey.slice(0, separatorIndex)
  return RETIRED_MODEL_KEYS.has(baseKey) ? baseKey : ''
}

export function canonicalizeApiMode(apiMode) {
  if (!apiMode || typeof apiMode !== 'object') return apiMode

  const retiredGroupTarget = RETIRED_GROUP_TARGETS.get(apiMode.groupName)
  if (retiredGroupTarget) {
    return {
      ...apiMode,
      groupName: retiredGroupTarget.groupName,
      itemName: retiredGroupTarget.itemName,
      customName: '',
      isCustom: false,
    }
  }

  const canonicalItemName = canonicalizeModelKey(apiMode.itemName)
  const canonicalGroupName = getCanonicalModelKeyGroupName(canonicalItemName, apiMode.groupName)
  const hasItemNameChange = canonicalItemName !== apiMode.itemName
  const hasGroupNameChange = canonicalGroupName !== apiMode.groupName

  if (!hasItemNameChange && !hasGroupNameChange) return apiMode

  // A stored row keeps the tone in customName rather than in itemName, so the
  // suffix survives the remap as a custom name the target provider never had.
  const dropsRetiredCustomName =
    hasItemNameChange && Boolean(getRetiredModelKeyBase(apiMode.itemName))

  return {
    ...apiMode,
    itemName: canonicalItemName,
    groupName: canonicalGroupName,
    ...(dropsRetiredCustomName ? { customName: '', isCustom: false } : {}),
  }
}

export function canonicalizeModelKeyArray(modelKeys) {
  if (!Array.isArray(modelKeys)) return modelKeys

  let changed = false
  const seen = new Set()
  const result = []

  for (const modelKey of modelKeys) {
    const canonicalModelKey = canonicalizeModelKey(modelKey)
    if (canonicalModelKey !== modelKey) changed = true
    if (seen.has(canonicalModelKey)) {
      changed = true
      continue
    }
    seen.add(canonicalModelKey)
    result.push(canonicalModelKey)
  }

  return changed ? result : modelKeys
}

// The GitHub third party backend continued a conversation through these fields.
// They were renamed when the Bing provider was removed, so stored sessions still
// carrying the old names need renaming or their next request loses the link.
const LEGACY_THIRD_PARTY_SESSION_FIELDS = {
  bingWeb_encryptedConversationSignature: 'thirdPartySignature',
  bingWeb_conversationId: 'thirdPartyConversationId',
  bingWeb_clientId: 'thirdPartyClientId',
  bingWeb_invocationId: 'thirdPartyInvocationId',
}

function migrateSessionFields(session) {
  let changed = false
  const migrated = { ...session }
  for (const [legacyField, currentField] of Object.entries(LEGACY_THIRD_PARTY_SESSION_FIELDS)) {
    if (!(legacyField in migrated)) continue
    if (!(currentField in migrated)) migrated[currentField] = migrated[legacyField]
    delete migrated[legacyField]
    changed = true
  }
  return changed ? migrated : session
}

export function canonicalizeSessionModelFields(session) {
  if (!session || typeof session !== 'object') return session

  const canonicalSession = migrateSessionFields(session)
  const canonicalModelName = canonicalizeModelKey(canonicalSession.modelName)
  const canonicalApiMode = canonicalizeApiMode(canonicalSession.apiMode)

  if (
    canonicalSession === session &&
    canonicalModelName === session.modelName &&
    canonicalApiMode === session.apiMode
  ) {
    return session
  }

  return {
    ...canonicalSession,
    modelName: canonicalModelName,
    apiMode: canonicalApiMode,
  }
}
