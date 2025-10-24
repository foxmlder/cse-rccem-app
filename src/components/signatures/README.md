# Système de Signature Électronique

Système complet de signature électronique pour les comptes-rendus de réunions du CSE.

## Vue d'ensemble

Le système de signature électronique permet aux membres autorisés (Administrateurs et Présidents) de signer numériquement les comptes-rendus de réunions. Une fois qu'un compte-rendu est soumis pour signature, il passe par un workflow de validation avant d'être finalisé.

## Workflow de Signature

### 1. Statuts des Comptes-rendus

- **DRAFT** - Brouillon en cours de rédaction
- **PENDING_SIGNATURE** - En attente de signatures
- **SIGNED** - Toutes les signatures requises collectées
- **PUBLISHED** - Publié et finalisé (immuable)

### 2. Processus de Signature

1. Un compte-rendu en statut **DRAFT** est soumis pour signature
2. Le statut passe à **PENDING_SIGNATURE**
3. Les membres autorisés peuvent signer le compte-rendu
4. Quand toutes les signatures requises sont collectées, le statut passe automatiquement à **SIGNED**
5. Un administrateur peut ensuite publier le compte-rendu (statut **PUBLISHED**)

### 3. Règles de Signature

- Seuls les **ADMIN** et **PRESIDENT** actifs peuvent signer
- Un utilisateur ne peut signer qu'une seule fois par compte-rendu
- Les signatures peuvent être retirées tant que le statut est **PENDING_SIGNATURE**
- Les signatures ne peuvent plus être modifiées une fois le compte-rendu **SIGNED** ou **PUBLISHED**

## Composants

### SignatureCard

Affiche une signature individuelle avec les informations de l'utilisateur.

```tsx
import SignatureCard from '@/components/signatures/SignatureCard';

<SignatureCard
  signature={{
    id: 'sig-123',
    signedAt: new Date(),
    comments: 'Approuvé',
    user: {
      id: 'user-123',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      role: 'PRESIDENT',
      cseRole: 'Président',
    },
  }}
  currentUserId="user-456"
  canRemove={true}
  onRemove={(id) => handleRemove(id)}
  isRemoving={false}
/>
```

**Props :**
- `signature` - Objet signature avec utilisateur
- `currentUserId` - ID de l'utilisateur connecté (optionnel)
- `canRemove` - Si la signature peut être retirée (optionnel, défaut: false)
- `onRemove` - Fonction appelée lors du retrait (optionnel)
- `isRemoving` - État de chargement du retrait (optionnel, défaut: false)

### SignatureModal

Modal pour signer un compte-rendu avec un commentaire optionnel.

```tsx
import SignatureModal from '@/components/signatures/SignatureModal';

<SignatureModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSign={async (comments) => {
    await createSignature(minuteId, comments);
  }}
  minuteTitle="Réunion CSE - Janvier 2025"
/>
```

**Props :**
- `isOpen` - Contrôle l'affichage du modal
- `onClose` - Fonction appelée à la fermeture
- `onSign` - Fonction async appelée lors de la signature
- `minuteTitle` - Titre du compte-rendu (optionnel)

### MinuteViewer

Affiche un compte-rendu en lecture seule avec les signatures et la possibilité de signer.

```tsx
import MinuteViewer from '@/components/minutes/MinuteViewer';

<MinuteViewer
  minute={minuteData}
  currentUser={{
    id: session.user.id,
    role: session.user.role,
  }}
  requiredSignatures={2}
/>
```

**Props :**
- `minute` - Données complètes du compte-rendu avec signatures
- `currentUser` - Utilisateur connecté (id et role)
- `requiredSignatures` - Nombre de signatures requises

## API Routes

### POST /api/signatures

Créer une nouvelle signature pour un compte-rendu.

**Body :**
```json
{
  "minuteId": "minute-123",
  "comments": "Approuvé sans réserve" // optionnel
}
```

**Réponse :**
```json
{
  "id": "sig-123",
  "userId": "user-123",
  "minuteId": "minute-123",
  "signedAt": "2025-01-24T10:00:00Z",
  "comments": "Approuvé sans réserve",
  "user": {
    "id": "user-123",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "PRESIDENT",
    "cseRole": "Président"
  }
}
```

**Erreurs :**
- `401` - Non authentifié
- `403` - Pas l'autorisation de signer
- `404` - Compte-rendu non trouvé
- `400` - Déjà signé ou statut invalide

### GET /api/signatures

Récupérer la liste des signatures avec filtres optionnels.

**Query Parameters :**
- `minuteId` - Filtrer par compte-rendu
- `userId` - Filtrer par utilisateur

**Réponse :**
```json
[
  {
    "id": "sig-123",
    "signedAt": "2025-01-24T10:00:00Z",
    "comments": "Approuvé",
    "user": { /* ... */ },
    "minute": {
      "id": "minute-123",
      "status": "SIGNED",
      "meeting": { /* ... */ }
    }
  }
]
```

### DELETE /api/signatures/[id]

Retirer une signature (seulement la sienne, sauf ADMIN).

**Réponse :**
```json
{
  "message": "Signature retirée avec succès"
}
```

**Erreurs :**
- `401` - Non authentifié
- `403` - Pas l'autorisation de retirer cette signature
- `404` - Signature non trouvée
- `400` - Signature ne peut plus être retirée (compte-rendu déjà signé/publié)

## Utilitaires de Validation

### `canSignMinute(minuteStatus, userRole)`

Vérifie si un utilisateur peut signer un compte-rendu.

```typescript
import { canSignMinute } from '@/lib/validators/signature';

if (canSignMinute(minute.status, user.role)) {
  // Afficher le bouton de signature
}
```

### `canRemoveSignature(minuteStatus)`

Vérifie si une signature peut être retirée.

```typescript
import { canRemoveSignature } from '@/lib/validators/signature';

if (canRemoveSignature(minute.status)) {
  // Permettre le retrait
}
```

### `calculateSignatureProgress(current, required)`

Calcule la progression des signatures.

```typescript
import { calculateSignatureProgress } from '@/lib/validators/signature';

const progress = calculateSignatureProgress(2, 3);
// { percentage: 67, isComplete: false, label: "2/3 signatures" }
```

## Page de Gestion des Signatures

La page `/signatures` affiche :
- **Pour les utilisateurs normaux** : Leurs propres signatures
- **Pour les administrateurs** : Toutes les signatures du système

**Statistiques affichées :**
- Nombre total de signatures (ou signatures personnelles)
- Signatures du mois en cours
- Nombre de comptes-rendus signés

**Tableau des signatures avec :**
- Informations du compte-rendu
- Signataire (pour les admins)
- Date de signature
- Statut du compte-rendu
- Commentaire
- Lien vers le compte-rendu

## Logique Métier

### Auto-transition PENDING_SIGNATURE → SIGNED

Quand une signature est créée, le système vérifie automatiquement :
1. Combien de signatures le compte-rendu a maintenant
2. Combien de signatures sont requises (ADMIN + PRESIDENT actifs)
3. Si toutes les signatures sont collectées → Passe automatiquement à **SIGNED**

### Calcul des Signatures Requises

Le nombre de signatures requises est calculé dynamiquement :
```sql
SELECT COUNT(*) FROM users
WHERE role IN ('ADMIN', 'PRESIDENT')
AND isActive = true
```

Cela permet une flexibilité si l'organisation change (ajout/retrait de présidents/admins).

## Sécurité

- **Authentification** : Toutes les routes nécessitent une session valide
- **Autorisation** : Vérification des rôles avant chaque action
- **Validation** : Schémas Zod pour toutes les entrées
- **Intégrité** : Impossible de signer deux fois ou de retirer après finalisation
- **Audit** : Toutes les signatures sont horodatées et traçables

## Notifications (À implémenter)

Fonctionnalités futures possibles :
- Email aux signataires quand un compte-rendu est soumis
- Notification quand toutes les signatures sont collectées
- Rappels pour les signatures en attente
- Notification quand un compte-rendu est publié

## Exemples d'Utilisation

### Workflow Complet

```typescript
// 1. Créer et soumettre un compte-rendu
const minute = await createMinute({ meetingId, content });
await updateMinute(minute.id, { status: 'PENDING_SIGNATURE' });

// 2. Les signataires reçoivent une notification (à implémenter)

// 3. Premier signataire signe
await createSignature({ minuteId: minute.id, comments: 'Approuvé' });

// 4. Deuxième signataire signe
await createSignature({ minuteId: minute.id });
// → Le compte-rendu passe automatiquement à SIGNED

// 5. Publication finale par un admin
await updateMinute(minute.id, { status: 'PUBLISHED' });
```

### Afficher le Statut de Signature

```tsx
const SignatureStatus = ({ minute, requiredSignatures }) => {
  const progress = calculateSignatureProgress(
    minute.signatures.length,
    requiredSignatures
  );

  return (
    <div>
      <p>{progress.label}</p>
      <div className="progress-bar">
        <div style={{ width: `${progress.percentage}%` }} />
      </div>
      {progress.isComplete && <span>✓ Complet</span>}
    </div>
  );
};
```

## Tests

Pour tester le système de signature :

1. Créer des utilisateurs avec rôles ADMIN et PRESIDENT
2. Créer une réunion et un compte-rendu
3. Soumettre le compte-rendu pour signature
4. Vérifier que seuls les utilisateurs autorisés peuvent signer
5. Vérifier la transition automatique à SIGNED
6. Tester le retrait de signature
7. Vérifier l'impossibilité de modifier après publication

## Maintenance

### Ajouter de Nouveaux Rôles Signataires

Modifier `src/lib/validators/signature.ts` :

```typescript
export function getEligibleSignerRoles(): string[] {
  return ['ADMIN', 'PRESIDENT', 'VICE_PRESIDENT']; // Ajouter des rôles
}
```

### Changer le Calcul des Signatures Requises

Modifier la logique dans `src/app/api/signatures/route.ts` :

```typescript
// Exemple : Toujours 2 signatures minimum
const requiredSigners = Math.max(2, await prisma.user.count({
  where: { role: { in: ['ADMIN', 'PRESIDENT'] }, isActive: true }
}));
```
