import { useState } from 'react';
import { useCategories, useDeleteCategory, type Category } from '@/hooks/useCategories';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import CategoryFormModal from '../components/CategoryFormModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderTree,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen
} from 'lucide-react';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: categoriesData, isLoading, error } = useCategories();
  const deleteCategory = useDeleteCategory();

  // Build tree structure from flat categories array
  const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0
      });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    // Sort by displayOrder
    const sortByOrder = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.displayOrder - b.displayOrder);
      nodes.forEach(node => sortByOrder(node.children));
    };
    
    sortByOrder(rootCategories);
    return rootCategories;
  };

  // Flatten tree for search
  const flattenTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
    const result: CategoryTreeNode[] = [];
    
    const traverse = (nodes: CategoryTreeNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        traverse(node.children);
      });
    };
    
    traverse(nodes);
    return result;
  };

  const categories = categoriesData?.categories || [];
  const categoryTree = buildCategoryTree(categories);
  
  // Filter categories based on search
  const filteredTree = searchTerm 
    ? flattenTree(categoryTree).filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categoryTree;

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (deleteConfirmId === categoryId) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        setDeleteConfirmId(null);
      } catch (error) {
        // Error handled by mutation
      }
    } else {
      setDeleteConfirmId(categoryId);
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const renderCategoryNode = (category: CategoryTreeNode) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isDeleting = deleteCategory.isPending && deleteConfirmId === category.id;

    return (
      <div key={category.id} className="border-b border-gray-100 last:border-b-0">
        <div 
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${16 + category.level * 24}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="flex items-center space-x-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                ) : (
                  <Folder className="h-5 w-5 text-blue-500" />
                )
              ) : (
                <div className="h-5 w-5 bg-gray-300 rounded" />
              )}
              
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
            
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDelete(category.id)}
              disabled={isDeleting}
              className={`p-2 rounded transition-colors ${
                deleteConfirmId === category.id
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={deleteConfirmId === category.id ? 'Click again to confirm' : 'Delete category'}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children.map(child => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load categories" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories Tree */}
      <div className="bg-white rounded-lg border border-gray-200">
        {categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="h-12 w-12" />}
            title="No categories found"
            description="Get started by creating your first category"
            action={
              <button
                onClick={() => setIsFormModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            }
          />
        ) : searchTerm ? (
          <div>
            {filteredTree.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            ) : (
              <div>
                {filteredTree.map(category => (
                  <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="h-5 w-5 bg-gray-300 rounded" />
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {categoryTree.map(category => renderCategoryNode(category))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        categories={categories}
      />
    </div>
  );
}