# 🚀 Démarrage Rapide - CSE RCCEM App

## Résumé du projet

Application web de gestion du Comité Social et Économique pour RCCEM-Montataire.

**Stack technique** : Next.js 14 + Prisma + PostgreSQL (Neon) + Tailwind CSS

## 🎯 Ce qui est prêt

✅ Structure du projet complète  
✅ Configuration Prisma avec schéma de base de données  
✅ Package.json avec toutes les dépendances  
✅ Configuration Tailwind CSS  
✅ Configuration TypeScript  
✅ Seed de base de données avec 2 utilisateurs  
✅ Maquette de référence  
✅ Documentation complète  

## 📝 Fichiers importants à lire

1. **README.md** - Vue d'ensemble et installation
2. **CLAUDE_CODE_GUIDE.md** - Guide pour développer avec Claude Code
3. **SPECIFICATIONS.md** - Spécifications techniques détaillées
4. **TODO.md** - Liste des tâches de développement
5. **DEPLOYMENT.md** - Guide de déploiement Vercel + Neon
6. **MAQUETTE_REFERENCE.jsx** - Maquette UI de référence

## ⚡ Démarrage en 5 minutes

### 1. Installation
```bash
cd cse-rccem-app
npm install
```

### 2. Configuration base de données
```bash
# Créer .env.local
cp .env.example .env.local

# Éditer .env.local avec votre URL Neon :
# DATABASE_URL="postgresql://..."
```

### 3. Initialisation Prisma
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Lancement
```bash
npm run dev
```

Ouvrir http://localhost:3000

## 👥 Comptes de test

**Président** : f.muselet@rccem.fr / admin123  
**Membre** : f.lakhdar@rccem.fr / membre123

## 🤖 Développement avec Claude Code

### Installation Claude Code
```bash
# Installer globalement
npm install -g @anthropic/claude-code

# Lancer dans le projet
cd cse-rccem-app
claude-code
```

### Commandes suggérées pour démarrer

```
1. "Configure NextAuth.js avec authentification email/password selon le schéma Prisma"

2. "Crée la page de connexion avec un formulaire stylé selon la maquette"

3. "Crée le layout protégé avec header et navigation selon MAQUETTE_REFERENCE.jsx"

4. "Implémente la page dashboard avec les stats et la liste des réunions selon la maquette"

5. "Crée le système complet de gestion des réunions avec CRUD"
```

### Exemple de prompt optimal
```
En te basant sur :
- Le schéma Prisma dans prisma/schema.prisma
- La maquette dans MAQUETTE_REFERENCE.jsx
- Les spécifications dans SPECIFICATIONS.md

Crée [FONCTIONNALITÉ] avec :
- Les composants React nécessaires
- Les API routes Next.js
- La validation Zod
- Le style Tailwind selon la maquette
```

## 📦 Structure du projet

```
cse-rccem-app/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── (protected)/       # Routes protégées
│   │   │   ├── dashboard/
│   │   │   ├── reunions/
│   │   │   ├── convocations/
│   │   │   ├── remontees/
│   │   │   ├── comptes-rendus/
│   │   │   └── membres/
│   │   ├── api/               # API Routes
│   │   └── auth/              # Authentification
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants de base
│   │   ├── layout/           # Layout
│   │   └── [features]/       # Par fonctionnalité
│   ├── lib/                   # Utilitaires
│   └── types/                 # Types TypeScript
├── prisma/
│   ├── schema.prisma         # Schéma BDD
│   └── seed.ts               # Données initiales
└── Documentation/
```

## 🎨 Design system

**Couleurs** :
- Primary : Blue (#3b82f6)
- Success : Green (#10b981)  
- Warning : Orange (#f59e0b)
- Danger : Red (#ef4444)

**Composants** :
- Cards avec `shadow-md`
- Buttons avec hover transitions
- Icons de `lucide-react`
- Tailwind utility classes

## 🔑 Points clés du projet

### Workflow principal
1. Président crée une réunion
2. Définit l'ordre du jour
3. Envoie la convocation (PDF + email)
4. Membres soumettent des remontées
5. Réunion se tient
6. Compte-rendu rédigé
7. Envoyé pour signatures
8. Publié et diffusé

### Fonctionnalités prioritaires
1. ✨ Authentification sécurisée
2. ✨ Gestion des réunions
3. ✨ Génération PDF convocations
4. ✨ Envoi emails
5. ✨ Remontées du personnel
6. ✨ Comptes-rendus
7. ✨ Signatures électroniques

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [NextAuth Docs](https://next-auth.js.org)

## 🆘 Aide

### Problèmes courants

**"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**"Error: ECONNREFUSED connecting to database"**
- Vérifier DATABASE_URL dans .env.local
- Vérifier que Neon est accessible

**Build échoue**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Contact

Fabien Muselet - f.muselet@rccem.fr

---

**Note** : Ce projet est prêt à être développé avec Claude Code. 
Tous les fichiers de configuration sont en place, il ne reste plus qu'à coder ! 🚀
