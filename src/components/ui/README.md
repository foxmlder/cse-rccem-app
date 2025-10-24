# Composants UI Réutilisables

Bibliothèque de composants UI pour l'application CSE RCCEM.

## Installation

Les composants sont déjà disponibles dans le projet. Pour les utiliser :

```tsx
import { Button, Input, Card } from '@/components/ui';
```

## Composants Disponibles

### Button

Bouton réutilisable avec plusieurs variantes et tailles.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean - Affiche un spinner
- `icon`: ReactNode - Icône à afficher
- `fullWidth`: boolean - Prend toute la largeur

**Exemple:**
```tsx
<Button variant="primary" size="md" icon={<Plus />}>
  Ajouter
</Button>

<Button variant="danger" loading>
  Suppression...
</Button>
```

---

### Input

Champ de saisie avec label, erreur et texte d'aide.

**Props:**
- `label`: string - Label du champ
- `error`: string - Message d'erreur
- `helperText`: string - Texte d'aide
- `leftIcon`: ReactNode - Icône à gauche
- `rightIcon`: ReactNode - Icône à droite
- `fullWidth`: boolean

**Exemple:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="jean@example.com"
  helperText="Entrez votre adresse email"
  leftIcon={<Mail />}
  required
/>

<Input
  label="Mot de passe"
  type="password"
  error="Le mot de passe est requis"
/>
```

---

### Textarea

Zone de texte avec compteur de caractères optionnel.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `showCharCount`: boolean
- `maxLength`: number
- `fullWidth`: boolean

**Exemple:**
```tsx
<Textarea
  label="Description"
  rows={5}
  showCharCount
  maxLength={500}
  placeholder="Décrivez votre remontée..."
/>
```

---

### Select

Liste déroulante avec options.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{ value: string; label: string; disabled?: boolean }>
- `fullWidth`: boolean

**Exemple:**
```tsx
<Select
  label="Rôle"
  options={[
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ]}
  required
/>
```

---

### Badge

Badge pour afficher des statuts ou tags.

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean (default: true)
- `icon`: ReactNode
- `onRemove`: () => void - Callback pour supprimer

**Exemple:**
```tsx
<Badge variant="success">Actif</Badge>

<Badge variant="warning" icon={<AlertCircle />}>
  En attente
</Badge>

<Badge variant="primary" onRemove={() => console.log('removed')}>
  Tag supprimable
</Badge>
```

---

### Modal

Modal/Dialog avec overlay.

**Props:**
- `isOpen`: boolean - État d'ouverture
- `onClose`: () => void - Callback de fermeture
- `title`: string
- `description`: string
- `footer`: ReactNode - Contenu du footer
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Exemple:**
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmer la suppression"
  description="Cette action est irréversible"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Annuler
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Supprimer
      </Button>
    </>
  }
>
  <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
</Modal>
```

---

### Card

Carte conteneur avec header, body et footer.

**Composants:**
- `Card`: Conteneur principal
- `CardHeader`: En-tête avec titre et action
- `CardBody`: Contenu principal
- `CardFooter`: Pied de page avec actions

**Props Card:**
- `hover`: boolean - Effet hover
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'bordered' | 'elevated'

**Exemple:**
```tsx
<Card hover padding="md">
  <CardHeader
    title="Titre de la carte"
    description="Description de la carte"
    action={<Button size="sm">Action</Button>}
  />

  <CardBody>
    <p>Contenu de la carte...</p>
  </CardBody>

  <CardFooter align="right">
    <Button variant="ghost">Annuler</Button>
    <Button>Valider</Button>
  </CardFooter>
</Card>
```

---

### Alert

Message d'alerte/notification.

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'danger'
- `title`: string
- `icon`: ReactNode - Icône personnalisée
- `onClose`: () => void - Rend l'alerte fermable

**Exemple:**
```tsx
<Alert variant="success" title="Succès">
  L'opération a été effectuée avec succès.
</Alert>

<Alert variant="danger" onClose={() => setError(null)}>
  Une erreur est survenue. Veuillez réessayer.
</Alert>

<Alert variant="warning" title="Attention" icon={<AlertTriangle />}>
  Cette action nécessite une confirmation.
</Alert>
```

---

### Spinner

Indicateur de chargement.

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'secondary' | 'success' | 'danger' | 'white'
- `text`: string - Texte à afficher
- `fullScreen`: boolean - Affiche en plein écran

**Exemple:**
```tsx
<Spinner size="lg" text="Chargement en cours..." />

<Spinner fullScreen text="Veuillez patienter..." />

// Pour un spinner inline
<InlineSpinner size="sm" color="primary" />
```

---

## Utilisation Combinée

Exemple complet d'un formulaire utilisant plusieurs composants :

```tsx
import { Button, Input, Select, Textarea, Card, CardHeader, CardBody, CardFooter, Alert } from '@/components/ui';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function MyForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Nouveau membre"
          description="Ajoutez un nouveau membre au CSE"
        />

        <CardBody>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Input
            label="Nom complet"
            placeholder="Jean Dupont"
            required
            fullWidth
          />

          <Select
            label="Rôle"
            options={[
              { value: 'ADMIN', label: 'Administrateur' },
              { value: 'MEMBER', label: 'Membre' },
            ]}
            required
            fullWidth
          />

          <Textarea
            label="Bio"
            rows={4}
            showCharCount
            maxLength={200}
            fullWidth
          />
        </CardBody>

        <CardFooter>
          <Button type="button" variant="ghost">
            Annuler
          </Button>
          <Button type="submit" loading={loading} icon={<Save />}>
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

## Personnalisation

Tous les composants acceptent une prop `className` pour ajouter des styles personnalisés :

```tsx
<Button className="custom-class">Mon bouton</Button>
```

Les composants utilisent la fonction `cn()` de `@/lib/utils` qui combine Tailwind CSS classes intelligemment.

## Accessibilité

Tous les composants sont conçus avec l'accessibilité en tête :
- Labels associés aux inputs (for/id)
- Attributs ARIA appropriés
- Support du clavier (Escape pour fermer les modals)
- Focus visible
- Messages d'erreur accessibles

## Support TypeScript

Tous les composants sont entièrement typés avec TypeScript et exportent leurs types :

```tsx
import { ButtonProps, InputProps } from '@/components/ui';
```
