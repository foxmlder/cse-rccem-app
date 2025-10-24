# Spécifications techniques - CSE RCCEM-Montataire

## 🎯 Vue d'ensemble

Application web complète pour la gestion du CSE (Comité Social et Économique) d'une entreprise de moins de 50 salariés.

## 👥 Utilisateurs et rôles

### Rôles définis
- **PRESIDENT** : Président du CSE (droits complets)
- **ADMIN** : Administrateur système
- **MEMBER** : Membre du CSE (titulaire ou suppléant)

### Utilisateurs initiaux
1. **Fabien Muselet** (f.muselet@rccem.fr)
   - Rôle : PRESIDENT
   - CSE Role : Président du CSE
   - Droits : Création réunions, envoi convocations, rédaction CR

2. **Fatiha Lakhdar** (f.lakhdar@rccem.fr)
   - Rôle : MEMBER
   - CSE Role : Titulaire CSE
   - Droits : Soumission remontées, signature CR

## 📊 Modèle de données

### Entités principales

#### User
```typescript
{
  id: string (cuid)
  email: string (unique)
  name: string
  password: string (hashed)
  role: UserRole
  cseRole: string (ex: "Président", "Secrétaire")
  isActive: boolean
}
```

#### Meeting
```typescript
{
  id: string
  date: DateTime
  time: string ("HH:MM")
  type: "ORDINARY" | "EXTRAORDINARY"
  status: "PLANNED" | "CONVOCATION_SENT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  location: string
  convocationSentAt: DateTime
  feedbackDeadline: DateTime
  participants: MeetingParticipant[]
  agendaItems: AgendaItem[]
  feedbacks: Feedback[]
  minutes: MeetingMinute[]
}
```

#### AgendaItem
```typescript
{
  id: string
  meetingId: string
  order: number
  title: string
  description: string
  duration: number (minutes)
}
```

#### Feedback (Remontée)
```typescript
{
  id: string
  meetingId: string
  submittedById: string
  subject: string
  description: string
  category: FeedbackCategory
  status: "PENDING" | "IN_PROGRESS" | "ADDRESSED" | "REJECTED"
  response: string
  submittedAt: DateTime
}
```

#### MeetingMinute
```typescript
{
  id: string
  meetingId: string (unique)
  content: string (HTML/Markdown)
  status: "DRAFT" | "PENDING_SIGNATURE" | "SIGNED" | "PUBLISHED"
  pdfUrl: string
  sentAt: DateTime
  signatures: Signature[]
}
```

#### Signature
```typescript
{
  id: string
  minuteId: string
  userId: string
  signatureData: string (base64 image)
  signedAt: DateTime
  ipAddress: string
  userAgent: string
}
```

## 🔄 Flux de travail

### 1. Création d'une réunion
1. Président crée une réunion (date, heure, type)
2. Définit les participants
3. Définit la date limite pour les remontées
4. Crée l'ordre du jour initial

### 2. Convocation
1. Président finalise l'ordre du jour
2. Système génère PDF de convocation
3. Envoi automatique par email à tous les participants
4. Status réunion → "CONVOCATION_SENT"

### 3. Remontées du personnel
1. Membres soumettent des remontées jusqu'à la deadline
2. Catégorisation automatique
3. Les remontées apparaissent dans une section dédiée
4. Président peut les intégrer à l'ordre du jour

### 4. Réunion
1. Status passe à "IN_PROGRESS" le jour J
2. Participants marqués présents/absents
3. Après réunion : status → "COMPLETED"

### 5. Compte-rendu
1. Président ou secrétaire rédige le CR
2. Status CR → "DRAFT"
3. Génération PDF
4. Envoi pour signature → "PENDING_SIGNATURE"
5. Membres signent électroniquement
6. Une fois toutes les signatures → "SIGNED"
7. Publication et envoi automatique → "PUBLISHED"

## 🎨 Interface utilisateur

### Design system
- **Palette de couleurs**
  - Primary: Blue (#3b82f6)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Danger: Red (#ef4444)
  - Gray scale pour textes et backgrounds

- **Typographie**
  - Titres: font-bold
  - Corps: font-normal
  - Taille base: text-base

- **Composants**
  - Cards avec shadow-md
  - Buttons avec hover transitions
  - Forms avec validation visuelle
  - Badges pour statuts
  - Icons de lucide-react

### Pages principales

#### Dashboard
- 3 cartes de statistiques (prochaine réunion, CR en attente, nombre de membres)
- Liste des réunions avec filtres
- Actions rapides : créer réunion, voir remontées

#### Convocations
- Form de création/édition
- Liste des points à l'ordre du jour (drag & drop pour réorganiser)
- Prévisualisation PDF
- Bouton d'envoi avec confirmation

#### Remontées
- Formulaire de soumission (deadline visible)
- Liste par réunion
- Filtres par catégorie et statut
- Vue détaillée avec réponses

#### Comptes-rendus
- Éditeur de texte riche (simple)
- Sections prédéfinies : présents, ordre du jour, décisions, questions diverses
- Prévisualisation PDF
- Liste des signataires avec statut
- Pad de signature

#### Membres
- Table avec nom, rôle, email
- Actions : ajouter, modifier, désactiver
- Filtre par rôle

## 📄 Génération de PDF

### Template convocation
```
Header:
- Logo RCCEM (si disponible)
- Titre : "Convocation à la réunion du CSE"
- Date et heure

Body:
- Type de réunion
- Lieu
- Participants convoqués
- Ordre du jour numéroté avec durées
- Date limite pour remontées (si applicable)

Footer:
- Signature du président
- Date d'envoi
```

### Template compte-rendu
```
Header:
- Logo RCCEM
- Titre : "Compte-rendu de réunion CSE"
- Date et heure de la réunion

Body:
- Présents / Absents / Excusés
- Ordre du jour traité
- Pour chaque point :
  * Discussions
  * Décisions prises
  * Actions à mener
- Questions diverses
- Date de la prochaine réunion (si définie)

Footer:
- Signatures des membres
- Date de signature
```

## 📧 Templates emails

### Convocation
```
Objet : Convocation - Réunion CSE du [DATE]

Bonjour [NOM],

Vous êtes convoqué(e) à la réunion du CSE qui se tiendra le [DATE] à [HEURE] en [LIEU].

Vous trouverez ci-joint la convocation avec l'ordre du jour.

Si vous souhaitez soumettre des questions ou remarques, vous pouvez le faire via l'application jusqu'au [DEADLINE].

Cordialement,
[PRESIDENT]
```

### Demande de signature CR
```
Objet : Signature du compte-rendu - Réunion CSE du [DATE]

Bonjour [NOM],

Le compte-rendu de la réunion du [DATE] est maintenant disponible pour signature.

Merci de vous connecter à l'application pour le consulter et le signer électroniquement.

Lien : [URL]

Cordialement,
[PRESIDENT]
```

### CR publié
```
Objet : Compte-rendu publié - Réunion CSE du [DATE]

Bonjour,

Le compte-rendu de la réunion du CSE du [DATE] a été signé et publié.

Vous le trouverez en pièce jointe.

Cordialement,
[PRESIDENT]
```

## 🔐 Sécurité

### Authentification
- NextAuth.js avec CredentialsProvider
- Passwords hashed avec bcrypt (10 rounds)
- Session JWT durée : 30 jours
- Cookie secure en production

### Autorizations
```typescript
Permissions par action :

CREATE_MEETING: PRESIDENT, ADMIN
EDIT_MEETING: PRESIDENT, ADMIN
DELETE_MEETING: PRESIDENT, ADMIN
SEND_CONVOCATION: PRESIDENT, ADMIN

SUBMIT_FEEDBACK: ALL_MEMBERS
EDIT_OWN_FEEDBACK: ALL_MEMBERS
DELETE_OWN_FEEDBACK: ALL_MEMBERS

CREATE_MINUTE: PRESIDENT, ADMIN
EDIT_MINUTE: PRESIDENT, ADMIN
SIGN_MINUTE: ALL_PARTICIPANTS
PUBLISH_MINUTE: PRESIDENT, ADMIN

VIEW_MEMBERS: ALL_MEMBERS
ADD_MEMBER: PRESIDENT, ADMIN
EDIT_MEMBER: PRESIDENT, ADMIN
REMOVE_MEMBER: PRESIDENT, ADMIN
```

### Validation
- Toutes les entrées validées avec Zod
- Protection CSRF native Next.js
- Rate limiting sur endpoints sensibles
- SQL injection protection via Prisma

## 🚀 Performance

### Optimizations
- ISR (Incremental Static Regeneration) pour pages publiques
- React Query pour cache côté client
- Lazy loading des composants lourds
- Images optimisées avec next/image
- Code splitting automatique Next.js

### Base de données
- Indexes sur champs fréquemment requêtés
- Pagination des listes longues
- Connexion pooling Prisma
- Queries optimisées (select uniquement les champs nécessaires)

## 🧪 Tests (optionnel pour v1)

- Tests unitaires : Vitest
- Tests d'intégration : Playwright
- Tests API : Supertest
- Coverage minimum : 70%

## 📱 Responsive

- Mobile-first approach
- Breakpoints Tailwind :
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

- Menu hamburger sur mobile
- Tables scrollables horizontalement
- Forms stack verticalement sur mobile
- Signature pad adaptatif

## 🌐 Internationalisation

- Langue : Français uniquement pour v1
- Formats dates : dd/MM/yyyy
- Format heure : HH:MM (24h)
- Timezone : Europe/Paris

## 📊 Analytics (optionnel)

- Vercel Analytics
- Tracking :
  - Réunions créées
  - Convocations envoyées
  - Remontées soumises
  - CR signés

## 🔄 Mise à jour future

Features possibles v2 :
- Chat intégré pour discussions
- Intégration calendrier (Google Calendar, Outlook)
- Notifications push
- Export Excel des données
- Dashboard statistiques avancé
- Mobile app (React Native)
- Multi-entreprises (SaaS)
