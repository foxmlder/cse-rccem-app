# Guide de contribution

## 🤝 Comment contribuer

Ce projet est développé pour RCCEM-Montataire. Les contributions sont les bienvenues !

## 📋 Avant de commencer

1. Fork le repository
2. Clone votre fork localement
3. Créer une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`

## 🔧 Configuration de l'environnement

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# Initialiser Prisma
npx prisma generate
npx prisma db push
npm run prisma:seed

# Lancer en développement
npm run dev
```

## 📝 Conventions de code

### Git commits
Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajoute la fonctionnalité de signature
fix: corrige le bug d'envoi d'email
docs: met à jour le README
style: formate le code
refactor: restructure les composants
test: ajoute des tests
chore: met à jour les dépendances
```

### Code style
- TypeScript strict mode
- ESLint pour le linting
- Prettier pour le formatage (si configuré)
- Tailwind CSS pour le styling
- Composants fonctionnels React avec hooks

### Structure des fichiers
```typescript
// Composant React
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [value, setValue] = useState('');
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

### API Routes
```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Valider les données
    const body = await req.json();
    const data = schema.parse(body);

    // Traitement...

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 🧪 Tests

```bash
# Lancer les tests (si configurés)
npm test

# Tests E2E (si configurés)
npm run test:e2e

# Vérifier le build
npm run build
```

## 📤 Soumettre une Pull Request

1. Assurez-vous que votre code fonctionne
2. Vérifier que le build passe : `npm run build`
3. Commit vos changements
4. Push vers votre fork
5. Créer une Pull Request sur GitHub

### Checklist PR
- [ ] Le code build sans erreurs
- [ ] Les fonctionnalités ont été testées manuellement
- [ ] Le code suit les conventions du projet
- [ ] Les commits suivent le format Conventional Commits
- [ ] La documentation a été mise à jour si nécessaire

## 🐛 Reporter un bug

Utiliser les [GitHub Issues](https://github.com/[username]/cse-rccem-app/issues) avec :

- Description claire du problème
- Steps to reproduce
- Comportement attendu vs actuel
- Screenshots si applicable
- Environnement (OS, navigateur, version)

## 💡 Proposer une fonctionnalité

1. Ouvrir une issue pour discuter de la fonctionnalité
2. Attendre validation avant de commencer le développement
3. Suivre le processus de PR

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Tailwind](https://tailwindcss.com/docs)

## ❓ Questions

Pour toute question, ouvrir une issue ou contacter : f.muselet@rccem.fr

Merci de contribuer à améliorer l'application CSE ! 🎉
