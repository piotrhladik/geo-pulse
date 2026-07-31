# 🚀 GEO Pulse AI — Darmowy Deployment (0 zł)

## 📋 Wymagane Konta (wszystkie DARMOWE)

| Usługa | Darmowy Limit | Link |
|--------|--------------|------|
| **Vercel** | Unlimited deploys, 100GB bandwidth | [vercel.com](https://vercel.com) |
| **Supabase** | 500MB database, 50K MAU | [supabase.com](https://supabase.com) |
| **Google Gemini** | 15 req/min, 1500 req/day | [aistudio.google.com](https://aistudio.google.com) |
| **Stripe** | 0% platform fee* | [stripe.com](https://stripe.com) |

*Stripe pobiera tylko 2.9% + $0.30 od każdej transakcji

---

## Krok 1: Utwórz Repozytorium GitHub

```bash
# Sklonuj lub stwórz nowe repo
git init geo-pulse-ai
cd geo-pulse-ai

# Dodaj wszystkie pliki
git add .
git commit -m "Initial commit: GEO Pulse AI"

# Wypchnij na GitHub
gh repo create geo-pulse-ai --public --push
# lub ręcznie przez github.com
```

---

## Krok 2: Skonfiguruj Supabase (Baza Danych)

### A. Utwórz Projekt
1. Idź na [supabase.com](https://supabase.com) → **New Project**
2. Wybierz nazwę: `geo-pulse-ai`
3. Ustaw hasło do bazy (zapisz je!)
4. Region: **EU West** (lub najbliższy)
5. Poczekaj ~2 minuty na utworzenie

### B. Pobierz Connection String
1. Idź do **Settings** → **Database**
2. Przewiń do **Connection string**
3. Wybierz **URI** i tryb **Transaction**
4. Skopiuj string, będzie wyglądał tak:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Zamień `[PASSWORD]` na hasło, które ustawiłeś

### C. Utwórz Tabele
1. Idź do **SQL Editor**
2. Wklej zawartość pliku `supabase/schema.sql`
3. Kliknij **Run**

---

## Krok 3: Skonfiguruj Google Gemini AI (Darmowe)

1. Idź na [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Zaloguj się kontem Google
3. Kliknij **Create API Key**
4. Wybierz projekt lub utwórz nowy
5. Skopiuj klucz API (zaczyna się od `AIza...`)

**Limity darmowego tier:**
- 15 zapytań/minutę
- 1,500 zapytań/dzień
- Model: `gemini-2.5-flash`

---

## Krok 4: Skonfiguruj Stripe (Płatności)

### A. Utwórz Konto
1. Idź na [stripe.com](https://stripe.com) → **Start now**
2. Wypełnij formularz rejestracji
3. Potwierdź email

### B. Pobierz API Keys
1. Idź do **Developers** → **API Keys**
2. Skopiuj:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### C. Utwórz Webhook
1. Idź do **Developers** → **Webhooks**
2. Kliknij **Add endpoint**
3. **Endpoint URL**: 
   ```
   https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhook/stripe
   ```
4. **Events to listen**:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Kliknij **Add endpoint**
6. Kliknij na utworzony endpoint
7. W sekcji **Signing secret** kliknij **Reveal**
8. Skopiuj `whsec_...`

---

## Krok 5: Deploy na Vercel

### A. Połącz z GitHub
1. Idź na [vercel.com](https://vercel.com) → **Add New Project**
2. Kliknij **Import Git Repository**
3. Wybierz `geo-pulse-ai`
4. Kliknij **Import**

### B. Skonfiguruj Environment Variables
W sekcji **Environment Variables** dodaj:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:...` (z Supabase) |
| `NEXT_PUBLIC_APP_URL` | `https://geo-pulse-ai.vercel.app` |
| `GEMINI_API_KEY` | `AIza...` (z Google AI Studio) |
| `STRIPE_SECRET_KEY` | `sk_test_...` (z Stripe) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (z Stripe Webhooks) |

### C. Deploy
1. Kliknij **Deploy**
2. Poczekaj ~2 minuty
3. Twoja aplikacja jest live! 🎉

---

## Krok 6: Zaktualizuj Webhook URL w Stripe

Po deploymencie:
1. Wróć do Stripe Dashboard → Webhooks
2. Edytuj endpoint
3. Zamień URL na prawdziwy:
   ```
   https://geo-pulse-ai.vercel.app/api/webhook/stripe
   ```

---

## ✅ Checklist Końcowy

- [ ] Supabase projekt utworzony
- [ ] Tabele w bazie utworzone (schema.sql)
- [ ] Google Gemini API key wygenerowany
- [ ] Stripe konto utworzone
- [ ] Stripe webhook skonfigurowany
- [ ] Vercel projekt zdeployowany
- [ ] Wszystkie ENV variables dodane
- [ ] Webhook URL zaktualizowany do produkcyjnego

---

## 🧪 Testowanie

### Test 1: Strona Główna
Otwórz `https://twoja-domena.vercel.app` — powinna się załadować

### Test 2: Audyt AI
1. Wpisz URL i nazwę marki
2. Kliknij "Analyze"
3. Sprawdź czy wyniki się pojawiają (Gemini AI działa)

### Test 3: Płatność (Test Mode)
1. Kliknij "Get Full Report" na pricing
2. Użyj karty testowej: `4242 4242 4242 4242`
3. Dowolna data wygaśnięcia (przyszła)
4. Dowolny CVC
5. Sprawdź redirect do dashboard z `?success=true`

### Test 4: Webhook
W Stripe Dashboard → Webhooks → Events sprawdź czy `checkout.session.completed` został odebrany

---

## 🔧 Troubleshooting

### "Gemini API error"
- Sprawdź czy `GEMINI_API_KEY` jest poprawny
- Sprawdź limity: max 15 req/min

### "Payment failed"
- Upewnij się, że używasz Test Mode keys (`sk_test_...`)
- Sprawdź czy webhook secret jest poprawny

### "Database connection failed"
- Użyj **Transaction** mode connection string
- Dodaj `?pgbouncer=true` na końcu URL jeśli brakuje

### Webhook zwraca 400
- Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
- Upewnij się, że URL webhooka jest dokładnie: `/api/webhook/stripe`

---

## 💰 Koszty

| Usługa | Koszt Miesięczny |
|--------|-----------------|
| Vercel Hosting | $0 |
| Supabase Database | $0 |
| Google Gemini AI | $0 |
| Stripe | $0 (+ 2.9% od transakcji) |
| **RAZEM** | **$0/miesiąc** |

Jedyny koszt to prowizja Stripe od każdej transakcji: **2.9% + $0.30**

Przy sprzedaży audytu za $29:
- Prowizja Stripe: $0.84 + $0.30 = **$1.14**
- Twój zysk: **$27.86**

---

## 📞 Wsparcie

Masz problemy? Sprawdź:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Google AI Docs](https://ai.google.dev/docs)
