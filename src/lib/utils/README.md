# Utilitaires de l'Application

Bibliothèque complète d'utilitaires pour l'application CSE RCCEM.

## Installation

Les utilitaires sont organisés par catégorie. Importez-les selon vos besoins :

```typescript
// Import tout depuis un seul endroit
import { formatDate, isValidEmail, unique } from '@/lib/utils';

// Ou import depuis des catégories spécifiques
import { formatCurrency, formatFileSize } from '@/lib/utils/format';
import { isValidEmail, isStrongPassword } from '@/lib/utils/validation';
```

## Catégories d'Utilitaires

### 1. Date (`date.ts`)

Utilitaires pour manipuler et formater les dates.

```typescript
import { formatDate, getRelativeTime, addDays, isPast } from '@/lib/utils/date';

// Formater une date
formatDate(new Date()); // "24 janvier 2025"

// Temps relatif
getRelativeTime(new Date('2025-01-23')); // "il y a 1 jour"

// Ajouter des jours
const tomorrow = addDays(new Date(), 1);

// Vérifier si dans le passé
isPast(new Date('2024-01-01')); // true
```

**Fonctions disponibles :**
- `formatDate()` - Formater date en français
- `formatTime()` - Formater heure
- `formatDateTime()` - Date et heure combinées
- `getRelativeTime()` - "il y a X..."
- `isPast()`, `isFuture()`, `isToday()`
- `addDays()`, `addHours()`
- `startOfDay()`, `endOfDay()`
- `getDaysDifference()`
- `toISODate()` - Format YYYY-MM-DD
- `parseFrenchDate()` - Parse DD/MM/YYYY
- `getDayName()`, `getMonthName()`
- `isSameDay()`, `getAge()`

---

### 2. Validation (`validation.ts`)

Valider différents types de données.

```typescript
import { isValidEmail, isStrongPassword, isValidPhoneNumber } from '@/lib/utils/validation';

// Email
isValidEmail('test@example.com'); // true

// Mot de passe fort
isStrongPassword('Password123'); // true
getPasswordStrength('abc'); // 0-4

// Téléphone français
isValidPhoneNumber('06 12 34 56 78'); // true

// SIRET
isValidSiret('12345678901234'); // true/false
```

**Fonctions disponibles :**
- `isValidEmail()` - Validation email
- `isStrongPassword()` - Mot de passe fort (8+ chars, maj, min, chiffre)
- `getPasswordStrength()` - Force (0-4)
- `isValidUrl()` - URL valide
- `isValidPhoneNumber()` - Téléphone français
- `isAlpha()`, `isNumeric()`, `isAlphanumeric()`
- `isEmpty()` - Null, undefined, vide
- `isValidDate()` - Date valide
- `isInRange()` - Nombre dans plage
- `isValidFileSize()`, `isValidFileType()`
- `isValidSiret()` - SIRET français
- `isValidPostalCode()` - Code postal
- `matchesPattern()` - Expression régulière
- `isValidCreditCard()` - Carte bancaire (Luhn)

---

### 3. Format (`format.ts`)

Formater des données pour l'affichage.

```typescript
import { formatCurrency, formatFileSize, formatPhoneNumber, truncate } from '@/lib/utils/format';

// Devise
formatCurrency(1234.56); // "1 234,56 €"

// Taille de fichier
formatFileSize(1048576); // "1 Mo"

// Téléphone
formatPhoneNumber('0612345678'); // "06 12 34 56 78"

// Tronquer texte
truncate('Long texte...', 10); // "Long te..."

// Initiales
getInitials('Jean Dupont'); // "JD"
```

**Fonctions disponibles :**
- `formatCurrency()` - Devise (EUR par défaut)
- `formatNumber()` - Nombre avec séparateurs
- `formatPercentage()` - Pourcentage
- `formatFileSize()` - octets → Ko/Mo/Go
- `formatPhoneNumber()` - Format français
- `formatSiret()` - Format SIRET
- `truncate()` - Tronquer avec ellipse
- `capitalize()`, `capitalizeWords()`
- `slugify()` - URL-friendly
- `getInitials()` - Initiales
- `formatDuration()` - Minutes → humain
- `formatList()` - Liste avec virgules et "et"
- `formatCreditCard()` - Masquer carte
- `toTitleCase()` - Titre
- `ordinal()` - 1er, 2ème...
- `maskEmail()` - Masquer email

---

### 4. API (`api.ts`)

Utilitaires pour les appels API.

```typescript
import { apiRequest, buildQueryString, debounce, retryRequest } from '@/lib/utils/api';

// Requête typée
const { data, error } = await apiRequest<User>('/api/users/123');

// Query string
const qs = buildQueryString({ page: 1, limit: 10 }); // "?page=1&limit=10"

// Debounce
const debouncedSearch = debounce((query) => {
  // Recherche API
}, 300);

// Retry avec backoff
await retryRequest(() => fetch('/api/data'), 3);
```

**Fonctions disponibles :**
- `apiRequest()` - Requête typée avec gestion d'erreurs
- `buildQueryString()` - Objet → query string
- `parseQueryString()` - Query string → objet
- `retryRequest()` - Retry avec backoff exponentiel
- `handleApiError()` - Extraire message d'erreur
- `isSuccessResponse()` - Vérifier statut 2xx
- `debounce()` - Debounce fonction
- `throttle()` - Throttle fonction
- `batchRequests()` - Batching de requêtes
- `createAbortController()` - Controller avec timeout
- `downloadFile()` - Télécharger fichier
- `uploadFile()` - Upload avec progression

---

### 5. Storage (`storage.ts`)

Gestion du stockage local, session et cookies.

```typescript
import { setLocalStorage, getLocalStorage, sessionStorage, cookies } from '@/lib/utils/storage';

// localStorage
setLocalStorage('user', { name: 'Jean' });
const user = getLocalStorage<User>('user');

// Avec expiration
setWithExpiry('token', 'abc123', 3600000); // 1h
const token = getWithExpiry('token');

// sessionStorage
sessionStorage.set('temp', data);
const temp = sessionStorage.get('temp');

// Cookies
cookies.set('theme', 'dark', 30); // 30 jours
const theme = cookies.get('theme');

// Formulaires
saveFormData('signup', formValues);
const saved = getFormData('signup');
```

**Fonctions disponibles :**
- `setLocalStorage()`, `getLocalStorage()`, `removeLocalStorage()`
- `clearLocalStorage()` - Vider tout le préfixe app
- `isLocalStorageAvailable()` - Vérifier disponibilité
- `getLocalStorageSize()` - Taille en bytes
- `setWithExpiry()`, `getWithExpiry()` - Avec TTL
- `sessionStorage` - Objet avec set/get/remove/clear
- `cookies` - Objet avec set/get/remove
- `saveFormData()`, `getFormData()`, `clearFormData()`
- `savePreferences()`, `getPreferences()`
- `addToRecentlyViewed()`, `getRecentlyViewed()`

---

### 6. String (`string.ts`)

Manipulation de chaînes de caractères.

```typescript
import { removeAccents, toCamelCase, randomString, escapeHtml } from '@/lib/utils/string';

// Retirer accents
removeAccents('Français'); // "Francais"

// Conversions de casse
toCamelCase('hello-world'); // "helloWorld"
toPascalCase('hello-world'); // "HelloWorld"
toSnakeCase('helloWorld'); // "hello_world"
toKebabCase('helloWorld'); // "hello-world"

// Échapper HTML
escapeHtml('<script>'); // "&lt;script&gt;"

// Aléatoire
randomString(10); // "aBc123XyZ4"
generateUUID(); // "550e8400-e29b-41d4-a716-446655440000"

// Pluralize
pluralize('chat', 2); // "chats"

// Distance Levenshtein
levenshteinDistance('kitten', 'sitting'); // 3
```

**Fonctions disponibles :**
- `removeAccents()` - Retirer accents
- `toCamelCase()`, `toPascalCase()`, `toSnakeCase()`, `toKebabCase()`
- `escapeHtml()`, `unescapeHtml()`
- `randomString()`, `generateUUID()`
- `pluralize()` - Pluriel selon count
- `reverse()` - Inverser
- `wordCount()` - Compter mots
- `extractNumbers()` - Extraire nombres
- `highlightMatches()` - Surligner correspondances
- `stripHtml()` - Retirer HTML
- `repeat()`, `padZero()`
- `isWhitespace()`, `firstWords()`
- `abbreviateMiddle()` - Ellipse au milieu
- `nl2br()`, `br2nl()` - Convertir retours ligne
- `equalsIgnoreCase()` - Comparer sans casse
- `startsWithAny()`, `endsWithAny()`
- `splitMultiple()` - Split par plusieurs délimiteurs
- `toBase64()`, `fromBase64()`
- `levenshteinDistance()` - Similarité de chaînes

---

### 7. Array (`array.ts`)

Manipulation de tableaux.

```typescript
import { unique, chunk, shuffle, groupBy, sortBy } from '@/lib/utils/array';

// Unique
unique([1, 2, 2, 3]); // [1, 2, 3]
uniqueBy(users, 'email'); // Unique par clé

// Découper en chunks
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Mélanger
shuffle([1, 2, 3]); // [2, 3, 1] (aléatoire)

// Grouper
groupBy(users, 'role'); // { ADMIN: [...], MEMBER: [...] }

// Trier
sortBy(users, 'name', 'asc');

// Statistiques
sum([1, 2, 3]); // 6
average([1, 2, 3]); // 2
min([1, 2, 3]); // 1
max([1, 2, 3]); // 3
```

**Fonctions disponibles :**
- `unique()`, `uniqueBy()` - Retirer doublons
- `chunk()` - Découper en morceaux
- `shuffle()` - Mélanger (Fisher-Yates)
- `randomElement()`, `randomElements()`
- `groupBy()` - Grouper par clé
- `countBy()` - Compter occurrences
- `sortBy()` - Trier par clé
- `findBy()`, `filterBy()`
- `partition()` - Séparer selon condition
- `intersection()`, `difference()`, `union()`
- `flatten()` - Aplatir tableaux imbriqués
- `compact()` - Retirer valeurs falsy
- `take()`, `takeLast()`, `drop()`, `dropLast()`
- `move()` - Déplacer élément
- `insertAt()`, `removeAt()`, `updateAt()`
- `sum()`, `average()`, `min()`, `max()`
- `range()` - Générer plage
- `zip()` - Zipper tableaux
- `fromEntries()` - Paires → objet
- `rotate()` - Rotation
- `areEqual()` - Égalité
- `deepClone()` - Clonage profond

---

## Exemples d'Utilisation Combinée

### Validation de formulaire

```typescript
import { isValidEmail, isStrongPassword, isEmpty } from '@/lib/utils';

function validateForm(data: FormData) {
  const errors: Record<string, string> = {};

  if (isEmpty(data.email)) {
    errors.email = 'Email requis';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email invalide';
  }

  if (!isStrongPassword(data.password)) {
    errors.password = 'Mot de passe trop faible';
  }

  return errors;
}
```

### Affichage de liste

```typescript
import { sortBy, formatDate, truncate } from '@/lib/utils';

function MeetingsList({ meetings }: { meetings: Meeting[] }) {
  const sorted = sortBy(meetings, 'date', 'desc');

  return sorted.map((meeting) => (
    <div key={meeting.id}>
      <h3>{truncate(meeting.title, 50)}</h3>
      <p>{formatDate(meeting.date)}</p>
      <span>{getRelativeTime(meeting.date)}</span>
    </div>
  ));
}
```

### Recherche avec debounce

```typescript
import { debounce, apiRequest } from '@/lib/utils';

const debouncedSearch = debounce(async (query: string) => {
  const { data, error } = await apiRequest<SearchResults>(
    `/api/search?q=${encodeURIComponent(query)}`
  );

  if (data) {
    setResults(data.results);
  }
}, 300);
```

### Gestion de cache

```typescript
import { setWithExpiry, getWithExpiry } from '@/lib/utils';

// Sauvegarder avec expiration
async function fetchUserData(userId: string) {
  const cached = getWithExpiry<User>(`user-${userId}`);
  if (cached) return cached;

  const user = await api.getUser(userId);
  setWithExpiry(`user-${userId}`, user, 3600000); // 1h
  return user;
}
```

## TypeScript

Tous les utilitaires sont entièrement typés avec TypeScript :

```typescript
// Types automatiquement inférés
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2); // number[]

// Types génériques
const users = await apiRequest<User[]>('/api/users');
const cached = getLocalStorage<Settings>('settings');
```

## Performance

- Les fonctions sont optimisées pour la performance
- Immutabilité : les fonctions de tableau retournent de nouveaux tableaux
- Memoization disponible via `debounce` et `throttle`
- Lazy evaluation quand approprié

## Compatibilité

- Supporté dans tous les navigateurs modernes
- Edge cases gérés
- Validation stricte des entrées
- Messages d'erreur clairs

## Ajout de Nouveaux Utilitaires

Pour ajouter une nouvelle fonction :

1. Ajoutez-la dans le fichier de catégorie approprié
2. Exportez-la depuis `index.ts`
3. Documentez-la avec JSDoc
4. Ajoutez des exemples dans ce README

```typescript
/**
 * Description de la fonction
 * @param param1 - Description du paramètre
 * @returns Description du retour
 * @example
 * maFonction('exemple') // résultat attendu
 */
export function maFonction(param1: string): string {
  // Implémentation
}
```
