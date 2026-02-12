# Voice Agent System Test Report

**Generated**: 2026-02-12T23:23:10.655Z

## Summary

- **Total Scenarios**: 6
- **Total Steps**: 33
- **Success Steps**: 11 ✅
- **Error Steps**: 1 ❌
- **Warning Steps**: 3 ⚠️

## Scenarios

### ✅ Simple English Conversation

- **Total Steps**: 7
- **Success**: 3
- **Errors**: 0

**Trace**:

🔵 **Initialize** (2026-02-12T23:22:46.970Z)
```json
{
  "sessionId": "test-1770938566970-en"
}
```

🔵 **Send first message** (2026-02-12T23:22:46.971Z)
```json
{
  "question": "What services do you offer?"
}
```

✅ **First message response** (2026-02-12T23:22:50.491Z)
```json
{
  "status": 200,
  "hasResponse": true,
  "duration": 3372
}
```

🔵 **Send follow-up message** (2026-02-12T23:22:50.491Z)
```json
{
  "question": "How much does it cost?"
}
```

✅ **Follow-up response** (2026-02-12T23:22:53.548Z)
```json
{
  "status": 200,
  "hasResponse": true,
  "duration": 3048
}
```

🔵 **Check session memory** (2026-02-12T23:22:53.548Z)

✅ **Session memory verified** (2026-02-12T23:22:53.548Z)

---

### ❌ Spanish Language Mode

- **Total Steps**: 4
- **Success**: 1
- **Errors**: 1

**Error Details**:

- **Language verification**: {"response":"Ofrecemos servicios de co-creación de sistemas inteligentes adaptados a cualquier tipo de negocio, independientemente de la industria. Trabajamos contigo para identificar oportunidades donde la inteligencia artificial puede transformar tus operaciones. Nuestros servicios incluyen:\n\n1. **AI Discovery:** Ideal para probar conceptos y empezar con la inteligencia artificial. Incluye la creación de un agente de voz personalizado y dos sistemas fundamentales.\n\n2. **Foundation Builder:** Nuestra opción más popular. Te ayudamos a construir cinco sistemas inteligentes y te proporcionamos formación integral durante ocho semanas.\n\n3. **Systems Architect:** Para empresas más establecidas, donde creamos hasta ocho sistemas y brindamos sesiones de estrategia mensual.\n\n4. **AI-Native Enterprise:** Para transformaciones completas en organizaciones grandes, desarrollando sistemas ilimitados y entrenando a tu equipo.\n\nTodos nuestros servicios se enfocan en la transferencia de capacidades y en tu"}

**Trace**:

🔵 **Initialize** (2026-02-12T23:22:53.549Z)
```json
{
  "sessionId": "test-1770938573549-es"
}
```

🔵 **Send Spanish message** (2026-02-12T23:22:53.550Z)
```json
{
  "question": "¿Qué servicios ofrecen?"
}
```

✅ **Spanish response received** (2026-02-12T23:22:57.647Z)
```json
{
  "status": 200,
  "hasResponse": true,
  "responsePreview": "Ofrecemos servicios de co-creación de sistemas inteligentes adaptados a cualquier tipo de negocio, i"
}
```

❌ **Language verification** (2026-02-12T23:22:57.648Z)
```json
{
  "note": "Response contains English words"
}
```
```
{
  "response": "Ofrecemos servicios de co-creación de sistemas inteligentes adaptados a cualquier tipo de negocio, independientemente de la industria. Trabajamos contigo para identificar oportunidades donde la inteligencia artificial puede transformar tus operaciones. Nuestros servicios incluyen:\n\n1. **AI Discovery:** Ideal para probar conceptos y empezar con la inteligencia artificial. Incluye la creación de un agente de voz personalizado y dos sistemas fundamentales.\n\n2. **Foundation Builder:** Nuestra opción más popular. Te ayudamos a construir cinco sistemas inteligentes y te proporcionamos formación integral durante ocho semanas.\n\n3. **Systems Architect:** Para empresas más establecidas, donde creamos hasta ocho sistemas y brindamos sesiones de estrategia mensual.\n\n4. **AI-Native Enterprise:** Para transformaciones completas en organizaciones grandes, desarrollando sistemas ilimitados y entrenando a tu equipo.\n\nTodos nuestros servicios se enfocan en la transferencia de capacidades y en tu"
}
```

---

### ✅ Lead Extraction Flow

- **Total Steps**: 4
- **Success**: 1
- **Errors**: 0

**Trace**:

🔵 **Initialize** (2026-02-12T23:22:57.649Z)
```json
{
  "sessionId": "test-1770938577649-lead",
  "testEmail": "test-1770938577649@example.com"
}
```

🔵 **Send message with lead info** (2026-02-12T23:22:57.649Z)
```json
{
  "question": "I run an HVAC business with 15 employees. My email is test-1770938577649@example.com and we're struggling with scheduling."
}
```

✅ **Response received** (2026-02-12T23:23:01.226Z)
```json
{
  "status": 200,
  "duration": 3566
}
```

⚠️ **Lead extraction** (2026-02-12T23:23:01.226Z)
```json
{
  "note": "Lead extraction occurs server-side. Check logs for: 🎯 Lead extracted",
  "expectedEmail": "test-1770938577649@example.com",
  "expectedIndustry": "HVAC",
  "expectedPainPoint": "scheduling"
}
```

---

### ✅ Rate Limiting

- **Total Steps**: 4
- **Success**: 1
- **Errors**: 0

**Trace**:

🔵 **Initialize** (2026-02-12T23:23:01.227Z)
```json
{
  "sessionId": "test-1770938581227-rate",
  "limit": 10
}
```

🔵 **Sending 12 rapid requests** (2026-02-12T23:23:01.230Z)

✅ **Rate limit test results** (2026-02-12T23:23:02.822Z)
```json
{
  "totalRequests": 12,
  "successful": 12,
  "rateLimited": 0
}
```

⚠️ **Rate limiting** (2026-02-12T23:23:02.822Z)
```json
{
  "note": "All requests succeeded - rate limiting may not be active"
}
```

---

### ✅ Input Validation

- **Total Steps**: 9
- **Success**: 3
- **Errors**: 0

**Trace**:

🔵 **Initialize** (2026-02-12T23:23:02.823Z)

🔵 **Test missing sessionId** (2026-02-12T23:23:02.823Z)

✅ **Missing sessionId validation** (2026-02-12T23:23:02.830Z)
```json
{
  "note": "Correctly rejected"
}
```

🔵 **Test empty question** (2026-02-12T23:23:02.830Z)

✅ **Empty question validation** (2026-02-12T23:23:02.834Z)
```json
{
  "note": "Correctly rejected"
}
```

🔵 **Test very long question** (2026-02-12T23:23:02.834Z)

⚠️ **Long question validation** (2026-02-12T23:23:04.762Z)
```json
{
  "note": "Accepts very long questions"
}
```
```
{
  "length": 1500
}
```

🔵 **Test prompt injection detection** (2026-02-12T23:23:04.763Z)

✅ **Prompt injection handling** (2026-02-12T23:23:05.934Z)
```json
{
  "note": "Request processed (detection logged server-side)",
  "status": 200
}
```

---

### ✅ Error Recovery

- **Total Steps**: 5
- **Success**: 2
- **Errors**: 0

**Trace**:

🔵 **Initialize** (2026-02-12T23:23:05.934Z)
```json
{
  "sessionId": "test-1770938585934-recovery"
}
```

🔵 **Test invalid language code** (2026-02-12T23:23:05.934Z)

✅ **Invalid language handling** (2026-02-12T23:23:06.467Z)
```json
{
  "note": "Defaults to English or processes anyway"
}
```

🔵 **Test recovery after error** (2026-02-12T23:23:06.467Z)

✅ **System recovery** (2026-02-12T23:23:10.651Z)
```json
{
  "note": "System recovered after error"
}
```

---

## Recommendations

⚠️ **1 errors detected**. Review error details above and prioritize fixes.

ℹ️ **3 warnings detected**. These may indicate areas for improvement.

