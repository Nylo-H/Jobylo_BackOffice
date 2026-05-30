import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  children?: Category[];
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Développement Web',
    slug: 'developpement-web',
    description: 'Sites web, applications, API',
    displayOrder: 1,
    children: [
      { id: '1-1', name: 'Frontend', slug: 'frontend', parentId: '1', displayOrder: 1 },
      { id: '1-2', name: 'Backend', slug: 'backend', parentId: '1', displayOrder: 2 },
      { id: '1-3', name: 'Fullstack', slug: 'fullstack', parentId: '1', displayOrder: 3 },
    ],
  },
  {
    id: '2',
    name: 'Design',
    slug: 'design',
    description: 'UI/UX, graphisme, branding',
    displayOrder: 2,
    children: [
      { id: '2-1', name: 'UI/UX Design', slug: 'ui-ux', parentId: '2', displayOrder: 1 },
      { id: '2-2', name: 'Logo & Branding', slug: 'logo-branding', parentId: '2', displayOrder: 2 },
    ],
  },
  {
    id: '3',
    name: 'Rédaction & Traduction',
    slug: 'redaction-traduction',
    description: 'Contenu, copywriting, traduction',
    displayOrder: 3,
  },
];

function CategoryCard({
  category,
  onEdit,
  onDelete,
  depth = 0,
}: {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div
        className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-variant transition-colors group"
        style={{ marginLeft: depth * 24 }}
      >
        <div className="flex items-center gap-3">
          <FolderTree size={16} className="text-warning" />
          <div>
            <p className="font-medium text-sm">{category.name}</p>
            {category.description && (
              <p className="text-xs text-text-secondary">{category.description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {category.slug}
          </Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
            <Trash2 size={14} className="text-error" />
          </Button>
        </div>
      </div>
      {category.children?.map((child) => (
        <CategoryCard
          key={child.id}
          category={child}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </motion.div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name, description } : cat
        )
      );
    } else {
      const newCat: Category = {
        id: String(Date.now()),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        displayOrder: categories.length + 1,
      };
      setCategories((prev) => [...prev, newCat]);
    }
    setDialogOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">📁 Catégories</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setName('');
            setDescription('');
            setDialogOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arborescence des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Nom</label>
              <Input
                placeholder="Nom de la catégorie"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Description</label>
              <Input
                placeholder="Description optionnelle"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}