# TODO - Application CSE RCCEM-Montataire

## ✅ Phase 0 : Configuration initiale (À faire en premier)

- [ ] Créer compte Neon et base de données
- [ ] Configurer les variables d'environnement dans `.env.local`
- [ ] Installer les dépendances : `npm install`
- [ ] Générer Prisma Client : `npx prisma generate`
- [ ] Pousser le schéma : `npx prisma db push`
- [ ] Créer les utilisateurs : `npm run prisma:seed`
- [ ] Vérifier avec Prisma Studio : `npx prisma studio`

## 🎯 Phase 1 : Structure de base Next.js

- [ ] Créer `src/app/layout.tsx` (Layout racine)
- [ ] Créer `src/app/page.tsx` (Page d'accueil → redirect)
- [ ] Créer `src/app/globals.css` (Styles Tailwind)
- [ ] Tester que l'app démarre : `npm run dev`

## 🔐 Phase 2 : Authentification

- [ ] Configurer NextAuth.js
  - [ ] Créer `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] Créer `src/lib/auth.ts` (config NextAuth)
  - [ ] Créer `src/lib/db.ts` (Prisma client)
- [ ] Créer page de connexion
  - [ ] `src/app/auth/signin/page.tsx`
  - [ ] `src/components/auth/LoginForm.tsx`
- [ ] Créer middleware de protection
  - [ ] `src/middleware.ts`
- [ ] Tester la connexion avec les 2 utilisateurs

## 🏠 Phase 3 : Layout et Navigation

- [ ] Créer layout protégé
  - [ ] `src/app/(protected)/layout.tsx`
- [ ] Créer composants de layout
  - [ ] `src/components/layout/Header.tsx`
  - [ ] `src/components/layout/Navigation.tsx`
  - [ ] `src/components/layout/UserMenu.tsx`
- [ ] Tester la navigation entre pages

## 📊 Phase 4 : Dashboard

- [ ] Créer page dashboard
  - [ ] `src/app/(protected)/dashboard/page.tsx`
- [ ] Créer composants dashboard
  - [ ] `src/components/dashboard/StatsCard.tsx`
  - [ ] `src/components/dashboard/MeetingList.tsx`
  - [ ] `src/components/dashboard/MeetingCard.tsx`
- [ ] Créer API routes
  - [ ] `src/app/api/meetings/route.ts` (GET, POST)
  - [ ] `src/app/api/meetings/stats/route.ts`
- [ ] Intégrer les vraies données depuis Prisma

## 👥 Phase 5 : Gestion des membres

- [ ] Créer page membres
  - [ ] `src/app/(protected)/membres/page.tsx`
- [ ] Créer composants
  - [ ] `src/components/members/MemberTable.tsx`
  - [ ] `src/components/members/MemberForm.tsx`
  - [ ] `src/components/members/MemberModal.tsx`
- [ ] API routes membres
  - [ ] `src/app/api/users/route.ts` (GET, POST)
  - [ ] `src/app/api/users/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Ajouter validation Zod
  - [ ] `src/lib/validators/user.ts`

## 📅 Phase 6 : Gestion des réunions

- [ ] Créer pages réunions
  - [ ] `src/app/(protected)/reunions/page.tsx` (liste)
  - [ ] `src/app/(protected)/reunions/[id]/page.tsx` (détail)
  - [ ] `src/app/(protected)/reunions/nouvelle/page.tsx`
- [ ] Créer composants
  - [ ] `src/components/meetings/MeetingForm.tsx`
  - [ ] `src/components/meetings/MeetingDetail.tsx`
  - [ ] `src/components/meetings/ParticipantSelector.tsx`
- [ ] API routes complètes
  - [ ] GET /api/meetings
  - [ ] POST /api/meetings
  - [ ] GET /api/meetings/[id]
  - [ ] PUT /api/meetings/[id]
  - [ ] DELETE /api/meetings/[id]
- [ ] Validation
  - [ ] `src/lib/validators/meeting.ts`

## 📝 Phase 7 : Convocations

- [ ] Créer pages convocations
  - [ ] `src/app/(protected)/convocations/[meetingId]/page.tsx`
- [ ] Créer composants
  - [ ] `src/components/convocations/ConvocationForm.tsx`
  - [ ] `src/components/convocations/AgendaItemEditor.tsx`
  - [ ] `src/components/convocations/ConvocationPreview.tsx`
- [ ] Génération PDF
  - [ ] `src/lib/pdf/convocation-template.tsx`
  - [ ] `src/app/api/convocations/generate/route.ts`
- [ ] Envoi email
  - [ ] `src/lib/email/send-convocation.ts`
  - [ ] `src/lib/email/templates/convocation.tsx`
  - [ ] `src/app/api/convocations/send/route.ts`
- [ ] API routes ordre du jour
  - [ ] POST /api/agenda-items
  - [ ] PUT /api/agenda-items/[id]
  - [ ] DELETE /api/agenda-items/[id]

## 💬 Phase 8 : Remontées du personnel

- [ ] Créer pages remontées
  - [ ] `src/app/(protected)/remontees/page.tsx` (toutes)
  - [ ] `src/app/(protected)/remontees/[meetingId]/page.tsx` (par réunion)
  - [ ] `src/app/(protected)/remontees/soumettre/page.tsx`
- [ ] Créer composants
  - [ ] `src/components/feedbacks/FeedbackForm.tsx`
  - [ ] `src/components/feedbacks/FeedbackList.tsx`
  - [ ] `src/components/feedbacks/FeedbackCard.tsx`
  - [ ] `src/components/feedbacks/FeedbackModal.tsx`
- [ ] API routes
  - [ ] GET /api/feedbacks (toutes)
  - [ ] GET /api/feedbacks?meetingId=xxx
  - [ ] POST /api/feedbacks
  - [ ] PUT /api/feedbacks/[id]
  - [ ] DELETE /api/feedbacks/[id]
- [ ] Validation
  - [ ] `src/lib/validators/feedback.ts`

## 📄 Phase 9 : Comptes-rendus

- [ ] Créer pages CR
  - [ ] `src/app/(protected)/comptes-rendus/page.tsx` (liste)
  - [ ] `src/app/(protected)/comptes-rendus/[meetingId]/page.tsx` (rédaction)
- [ ] Créer composants
  - [ ] `src/components/minutes/MinuteEditor.tsx`
  - [ ] `src/components/minutes/MinutePreview.tsx`
  - [ ] `src/components/minutes/MinuteList.tsx`
- [ ] Génération PDF
  - [ ] `src/lib/pdf/minute-template.tsx`
  - [ ] `src/app/api/minutes/generate-pdf/route.ts`
- [ ] API routes
  - [ ] GET /api/minutes
  - [ ] GET /api/minutes/[id]
  - [ ] POST /api/minutes
  - [ ] PUT /api/minutes/[id]
  - [ ] POST /api/minutes/[id]/publish
- [ ] Validation
  - [ ] `src/lib/validators/minute.ts`

## ✍️ Phase 10 : Signatures électroniques

- [ ] Créer page signature
  - [ ] `src/app/(protected)/comptes-rendus/[minuteId]/signer/page.tsx`
- [ ] Créer composants
  - [ ] `src/components/signatures/SignaturePad.tsx`
  - [ ] `src/components/signatures/SignatureList.tsx`
  - [ ] `src/components/signatures/SignatureStatus.tsx`
- [ ] API routes
  - [ ] POST /api/signatures
  - [ ] GET /api/signatures?minuteId=xxx
- [ ] Envoi notifications signature
  - [ ] `src/lib/email/send-signature-request.ts`
  - [ ] `src/lib/email/templates/signature-request.tsx`
- [ ] Publication automatique
  - [ ] `src/lib/email/send-published-minute.ts`
  - [ ] `src/lib/email/templates/published-minute.tsx`

## 🎨 Phase 11 : Composants UI réutilisables

- [ ] Créer composants UI de base
  - [ ] `src/components/ui/Button.tsx`
  - [ ] `src/components/ui/Input.tsx`
  - [ ] `src/components/ui/Select.tsx`
  - [ ] `src/components/ui/Textarea.tsx`
  - [ ] `src/components/ui/Modal.tsx`
  - [ ] `src/components/ui/Card.tsx`
  - [ ] `src/components/ui/Badge.tsx`
  - [ ] `src/components/ui/Alert.tsx`
  - [ ] `src/components/ui/Loading.tsx`
  - [ ] `src/components/ui/Pagination.tsx`

## 🛠️ Phase 12 : Utilitaires et helpers

- [ ] Créer utilitaires
  - [ ] `src/lib/utils.ts` (fonctions générales)
  - [ ] `src/lib/date.ts` (formatage dates)
  - [ ] `src/lib/permissions.ts` (vérification permissions)
- [ ] Créer types
  - [ ] `src/types/index.ts`
  - [ ] `src/types/auth.ts`
  - [ ] `src/types/meeting.ts`

## 🧪 Phase 13 : Tests et validation

- [ ] Tester toutes les fonctionnalités manuellement
  - [ ] Connexion / Déconnexion
  - [ ] Création réunion
  - [ ] Convocation + envoi email
  - [ ] Soumission remontées
  - [ ] Rédaction CR
  - [ ] Signature électronique
  - [ ] Publication CR
- [ ] Vérifier la responsivité mobile
- [ ] Vérifier l'accessibilité
- [ ] Optimiser les performances

## 🚀 Phase 14 : Déploiement

- [ ] Configurer Resend pour emails
- [ ] Pousser sur GitHub
- [ ] Connecter à Vercel
- [ ] Configurer variables d'env sur Vercel
- [ ] Déployer en production
- [ ] Tester en production
- [ ] Initialiser la base de données production

## 📚 Phase 15 : Documentation

- [ ] Créer guide utilisateur
  - [ ] Comment créer une réunion
  - [ ] Comment envoyer une convocation
  - [ ] Comment soumettre une remontée
  - [ ] Comment signer un CR
- [ ] Documenter l'API
- [ ] Créer FAQ

## 🎉 Phase 16 : Améliorations futures (optionnel)

- [ ] Notifications in-app
- [ ] Export Excel
- [ ] Intégration calendrier
- [ ] Chat intégré
- [ ] Version mobile (PWA)
- [ ] Multi-langue
- [ ] Thème sombre

---

## 📝 Notes importantes

### Ordre de priorité
1. Authentification (CRITIQUE)
2. Dashboard + Membres (BASE)
3. Réunions (CORE)
4. Convocations + Remontées (CORE)
5. Comptes-rendus + Signatures (CORE)
6. Polish et tests (IMPORTANT)
7. Déploiement (FINAL)

### À ne pas oublier
- Toujours valider les données côté serveur
- Gérer les erreurs proprement
- Messages de confirmation utilisateur
- Loading states
- Protection des routes par rôle
- Logs pour debugging

### Commandes utiles
```bash
# Développement
npm run dev

# Build
npm run build

# Prisma
npx prisma studio
npx prisma db push
npm run prisma:seed

# Vérifier TypeScript
npx tsc --noEmit

# Déploiement
vercel
vercel --prod
```
