# YouTube API Setup pro Fallback Mechanismus

## Proč YouTube API?

Fallback mechanismus používá YouTube Data API v3 k automatickému hledání alternativních videí, když AI navrhne neplatné nebo neembeddable video.

## Nastavení YouTube API

### 1. Vytvoření API klíče

1. Jděte na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvořte nový projekt nebo vyberte existující
3. Povolte YouTube Data API v3:
   - Jděte do "APIs & Services" > "Library"
   - Vyhledejte "YouTube Data API v3"
   - Klikněte "Enable"
4. Vytvořte API klíč:
   - Jděte do "APIs & Services" > "Credentials"
   - Klikněte "Create Credentials" > "API Key"
   - Zkopírujte klíč

### 2. Přidání do environment proměnných

Přidejte do vašeho `.env` souboru:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Omezení API klíče (volitelné, ale doporučené)

Pro bezpečnost omezte API klíč:
1. V Google Cloud Console klikněte na API klíč
2. V "Application restrictions" vyberte "HTTP referrers"
3. Přidejte vaše domény
4. V "API restrictions" vyberte "Restrict key"
5. Vyberte pouze "YouTube Data API v3"

## Limity a náklady

### Free Tier (zdarma):
- **10,000 jednotek denně**
- Každý search request = 100 jednotek
- Každý video info request = 1 jednotka

### Praktické limity:
- ~100 vyhledávání denně (search)
- ~10,000 ověření videí denně (video info)

### Pokud překročíte limit:
- $5 za 1,000 jednotek
- Pro většinu aplikací je free tier dostatečný

## Jak to funguje

### 1. AI vygeneruje workout s YouTube URL
### 2. Backend ověří každé video přes oEmbed API
### 3. Pokud video není embeddable:
   - Přeloží název cviku do angličtiny
   - Hledá alternativní video přes YouTube Search API
   - Preferuje wikiHow kanál
   - Ověří embeddability nalezeného videa
### 4. Uloží platné video nebo null

## Příklad použití

```typescript
// AI navrhla: "kliky" → https://www.youtube.com/watch?v=invalid123
// Backend ověří → NEPLATNÉ

// Fallback hledá:
// 1. "push-ups exercise tutorial wikiHow"
// 2. "how to do push-ups exercise"
// 3. "push-ups fitness tutorial"
// 4. "push-ups exercise"

// Najde: https://www.youtube.com/watch?v=valid456
// Ověří → PLATNÉ ✅
```

## Troubleshooting

### "YouTube API key not found"
- Zkontrolujte, že máte `YOUTUBE_API_KEY` v `.env` souboru
- Restartujte server po přidání environment proměnné

### "YouTube Search API error: 403"
- Zkontrolujte, že YouTube Data API v3 je povolené
- Zkontrolujte omezení API klíče

### "YouTube Search API error: 400"
- Zkontrolujte formát API klíče
- Zkontrolujte, že klíč není omezený na jiné domény

## Bezpečnost

- **Nikdy necommitněte API klíč** do Git repozitáře
- Používejte environment proměnné
- Omezte API klíč na vaše domény
- Monitorujte použití API v Google Cloud Console