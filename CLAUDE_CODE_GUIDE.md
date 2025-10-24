# Guide de développement avec Claude Code

## 🎯 Objectif

Développer l'application complète CSE RCCEM-Montataire en utilisant Claude Code pour générer le code selon la maquette fournie.

## 📋 Prérequis

Avant de démarrer avec Claude Code, assurez-vous que :
1. Node.js 18+ est installé
2. Un compte Neon est créé avec une base de données
3. Les variables d'environnement sont configurées dans `.env.local`

## 🚀 Étapes de développement

### 1. Initialisation du projet

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push

# Créer les utilisateurs initiaux
npm run prisma:seed
```

### 2. Structure à créer avec Claude Code

#### Phase 1 : Base et authentification
```
Commandes Claude Code :

1. "Crée la structure de base Next.js avec App Router dans src/app"
   - app/layout.tsx
   - app/page.tsx (redirect vers /dashboard)
   - app/globals.css (avec Tailwind)

2. "Configure NextAuth.js avec authentification par email/password"
   - app/api/auth/[...nextauth]/route.ts
   - lib/auth.ts
   - middleware.ts (protection des routes)

3. "Crée les pages d'authentification"
   - app/auth/signin/page.tsx
   - components/auth/LoginForm.tsx
```

#### Phase 2 : Dashboard et navigation
```
4. "Crée le layout principal avec navigation"
   - app/(protected)/layout.tsx
   - components/layout/Header.tsx
   - components/layout/Navigation.tsx

5. "Crée le tableau de bord selon la maquette cse-app-maquette.jsx"
   - app/(protected)/dashboard/page.tsx
   - components/dashboard/StatsCard.tsx
   - components/dashboard/MeetingList.tsx
```

#### Phase 3 : Gestion des réunions
```
6. "Crée le système de gestion des réunions"
   - app/(protected)/reunions/page.tsx
   - app/(protected)/reunions/[id]/page.tsx
   - app/api/meetings/route.ts
   - app/api/meetings/[id]/route.ts
   - components/meetings/MeetingForm.tsx
   - components/meetings/MeetingCard.tsx
```

#### Phase 4 : Convocations
```
7. "Implémente la création de convocations avec génération PDF"
   - app/(protected)/convocations/[meetingId]/page.tsx
   - app/api/convocations/generate/route.ts
   - lib/pdf/convocation-template.tsx
   - components/convocations/ConvocationForm.tsx
   - components/convocations/AgendaItemEditor.tsx

8. "Ajoute l'envoi d'emails pour les convocations"
   - lib/email/send-convocation.ts
   - lib/email/templates/convocation.tsx
```

#### Phase 5 : Remontées du personnel
```
9. "Crée le système de remontées du personnel"
   - app/(protected)/remontees/page.tsx
   - app/(protected)/remontees/[meetingId]/page.tsx
   - app/api/feedbacks/route.ts
   - app/api/feedbacks/[id]/route.ts
   - components/feedbacks/FeedbackForm.tsx
   - components/feedbacks/FeedbackList.tsx
   - components/feedbacks/FeedbackCard.tsx
```

#### Phase 6 : Comptes-rendus
```
10. "Implémente la rédaction des comptes-rendus"
    - app/(protected)/comptes-rendus/[meetingId]/page.tsx
    - app/api/minutes/route.ts
    - app/api/minutes/[id]/route.ts
    - components/minutes/MinuteEditor.tsx
    - lib/pdf/minute-template.tsx

11. "Ajoute le système de signature électronique"
    - app/(protected)/comptes-rendus/[minuteId]/signer/page.tsx
    - app/api/signatures/route.ts
    - components/signatures/SignaturePad.tsx
    - components/signatures/SignatureList.tsx
```

#### Phase 7 : Gestion des membres
```
12. "Crée la gestion des membres du CSE"
    - app/(protected)/membres/page.tsx
    - app/api/users/route.ts
    - app/api/users/[id]/route.ts
    - components/members/MemberForm.tsx
    - components/members/MemberTable.tsx
```

### 3. Composants réutilisables à créer

```
13. "Crée les composants UI réutilisables"
    - components/ui/Button.tsx
    - components/ui/Input.tsx
    - components/ui/Select.tsx
    - components/ui/Modal.tsx
    - components/ui/Card.tsx
    - components/ui/Badge.tsx
    - components/ui/Alert.tsx
```

### 4. Utilitaires et helpers

```
14. "Crée les utilitaires de l'application"
    - lib/db.ts (Client Prisma)
    - lib/utils.ts (Fonctions utiles)
    - lib/validators.ts (Schémas Zod)
    - types/index.ts (Types TypeScript)
```

## 📝 Points importants à respecter

### Fonctionnalités clés

1. **Convocations**
   - Génération automatique en PDF
   - Envoi par email à tous les participants
   - Ordre du jour modifiable
   - Date limite pour les remontées

2. **Remontées du personnel**
   - Soumission avant la date limite
   - Catégorisation (Conditions de travail, Organisation, Santé/Sécurité, etc.)
   - Affichage dans l'ordre du jour
   - Suivi du statut

3. **Comptes-rendus**
   - Rédaction après la réunion
   - Génération en PDF
   - Signature électronique multiple
   - Validation et publication
   - Envoi automatique après signature

4. **Sécurité**
   - Routes protégées par NextAuth
   - Permissions basées sur les rôles
   - Validation des données avec Zod
   - CSRF protection

### Style et UX

- Utiliser Tailwind CSS pour tous les styles
- Reprendre le design de la maquette fournie
- Interface responsive (mobile-first)
- Feedbacks utilisateur (loading, success, errors)
- Accessibilité (ARIA labels, keyboard navigation)

### Base de données

- Utiliser Prisma pour toutes les requêtes
- Gérer les erreurs de connexion
- Transactions pour les opérations critiques
- Indexation appropriée

### PDF et emails

- Utiliser @react-pdf/renderer pour les PDFs
- Template professionnel pour les documents
- Resend pour l'envoi d'emails
- Templates HTML responsive

## 🧪 Tests et validation

```bash
# Vérifier le build
npm run build

# Vérifier Prisma
npx prisma validate
npx prisma studio  # Interface graphique pour la DB

# Lancer en développement
npm run dev
```

## 🚢 Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déploiement production
vercel --prod
```

## ⚠️ Points de vigilance

1. **Sécurité des mots de passe**
   - Ne jamais exposer les mots de passe en clair
   - Toujours utiliser bcrypt pour le hashing

2. **Variables d'environnement**
   - Ne jamais commiter .env.local
   - Configurer toutes les variables sur Vercel

3. **Validation des données**
   - Valider côté serveur ET côté client
   - Utiliser Zod pour la validation

4. **Performance**
   - Optimiser les requêtes Prisma
   - Utiliser le caching Next.js
   - Images optimisées avec next/image

## 📚 Ressources utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React PDF Documentation](https://react-pdf.org)

## 🆘 En cas de problème

1. Vérifier les logs de développement
2. Vérifier la connexion à la base de données
3. Vérifier les variables d'environnement
4. Consulter la documentation Next.js
5. Utiliser Prisma Studio pour inspecter les données

## 🎉 Validation finale

Avant de mettre en production, vérifier :
- [ ] Toutes les pages sont fonctionnelles
- [ ] L'authentification fonctionne
- [ ] Les PDFs se génèrent correctement
- [ ] Les emails sont envoyés
- [ ] Les signatures fonctionnent
- [ ] La base de données est correctement configurée
- [ ] Les variables d'environnement sont sur Vercel
- [ ] Le build production passe
- [ ] Les tests manuels sont OK
