import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../lib/errors';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  displayOrder: number;
}

const ICON_SUGGESTIONS = ['🔧', '💻', '🎉', '📦', '🚗', '🏠', '🛠️', '✏️', '🎨', '📚'];

function CategoryTreeNode({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: Category;
  allCategories: Category[];
  level: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = allCategories
    .filter((c) => c.parentId === category.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-variant/70 group transition-colors"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-variant"
        >
          {children.length > 0 ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>
        <span className="text-lg w-7 text-center shrink-0">{category.icon || '📁'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{category.name}</p>
          {category.description && (
            <p className="text-xs text-text-secondary truncate">{category.description}</p>
          )}
        </div>
        <span className="text-xs text-text-hint">ordre: {category.displayOrder}</span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddChild(category.id)}
            title="Ajouter une sous-catégorie"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(category)} title="Modifier">
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(category)}
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5 text-error" />
          </Button>
        </div>
      </motion.div>
      {expanded &&
        children.map((child) => (
          <CategoryTreeNode
            key={child.id}
            category={child}
            allCategories={allCategories}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
    </>
  );
}

function CategoryFormDialog({
  category,
  defaultParentId,
  allCategories,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  category: Category | null;
  defaultParentId: string | null;
  allCategories: Category[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? '',
    parentId: category?.parentId ?? defaultParentId ?? null,
    displayOrder: category?.displayOrder ?? 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Mettez à jour les informations de la catégorie'
              : 'Créez une nouvelle catégorie'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...form,
              parentId: form.parentId || null,
              description: form.description.trim() || null,
              icon: form.icon.trim() || null,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">Nom *</label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Plomberie"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">Description</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Réparation, installation, dépannage..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">Icône</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="🔧"
                maxLength={4}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {ICON_SUGGESTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, icon: emoji })}
                    className="w-7 h-7 rounded border border-border hover:border-primary hover:bg-primary/5 text-sm transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">
                Ordre d'affichage
              </label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">
              Catégorie parente
            </label>
            <select
              value={form.parentId ?? 'none'}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value === 'none' ? null : e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="none">Aucune (catégorie racine)</option>
              {allCategories
                .filter((c) => c.id !== category?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ?? '📁'} {c.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-text-hint mt-1">
              ⚠️ Maximum 2 niveaux de profondeur recommandés
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {category ? 'Enregistrement...' : 'Création...'}
                </>
              ) : category ? (
                'Enregistrer'
              ) : (
                'Créer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Category, 'id'>) =>
      (await api.post<Category>('/admin/categories', data)).data,
    onSuccess: () => {
      toast.success('Catégorie créée');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erreur lors de la création')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Category, 'id'> }) =>
      (await api.put<Category>(`/admin/categories/${id}`, data)).data,
    onSuccess: () => {
      toast.success('Catégorie modifiée');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erreur lors de la modification')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/categories/${id}`)).data,
    onSuccess: () => {
      toast.success('Catégorie supprimée');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeleteTarget(null);
    },
    onError: (e) => {
      toast.error(getApiErrorMessage(e, 'Erreur lors de la suppression'));
      setDeleteTarget(null);
    },
  });

  const rootCategories = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const openNew = (pid: string | null) => {
    setEditing(null);
    setParentId(pid);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setParentId(cat.parentId);
    setDialogOpen(true);
  };

  const handleDelete = (cat: Category) => {
    setDeleteTarget(cat);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Catégories</h1>
          <p className="text-text-secondary text-sm mt-1">
            Organisez les catégories et sous-catégories de la plateforme
          </p>
        </div>
        <Button onClick={() => openNew(null)}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle catégorie
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-secondary mt-3">Chargement des catégories...</p>
            </div>
          ) : rootCategories.length === 0 ? (
            <div className="py-16 text-center">
              <FolderTree className="h-12 w-12 text-text-hint mx-auto mb-3" />
              <p className="text-text-primary font-medium">Aucune catégorie</p>
              <p className="text-sm text-text-secondary mt-1">
                Créez votre première catégorie pour commencer
              </p>
              <Button className="mt-4" onClick={() => openNew(null)}>
                <Plus className="h-4 w-4 mr-2" /> Créer une catégorie
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {rootCategories.map((cat) => (
                <CategoryTreeNode
                  key={cat.id}
                  category={cat}
                  allCategories={categories}
                  level={0}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddChild={openNew}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        key={dialogOpen ? (editing?.id ?? 'new-' + parentId) : 'closed'}
        category={editing}
        defaultParentId={parentId}
        allCategories={categories}
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setDialogOpen(false);
            setEditing(null);
          }
        }}
        onSubmit={(data) => {
          if (editing) updateMutation.mutate({ id: editing.id, data });
          else createMutation.mutate(data);
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-error" /> Supprimer la catégorie
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer "{deleteTarget?.name}" ?
              {deleteTarget && categories.some((c) => c.parentId === deleteTarget.id) && (
                <span className="block mt-2 text-warning">
                  ⚠️ Cette catégorie contient des sous-catégories qui seront également supprimées.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
