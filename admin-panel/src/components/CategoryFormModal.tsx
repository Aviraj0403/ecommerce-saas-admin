import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, type Category, type CreateCategoryData } from '@/hooks/useCategories';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  displayOrder: z.number().min(0, 'Display order must be 0 or greater').optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  categories: Category[];
}

export default function CategoryFormModal({ isOpen, onClose, category, categories }: CategoryFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string>('');
  const isEditing = !!category;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      parentId: '',
      displayOrder: 0,
      isActive: true,
    }
  });

  const watchedImage = watch('image');

  // Update image preview when image URL changes
  useEffect(() => {
    if (watchedImage && watchedImage !== imagePreview) {
      setImagePreview(watchedImage);
    }
  }, [watchedImage, imagePreview]);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          image: category.image || '',
          parentId: category.parentId || '',
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        });
        setImagePreview(category.image || '');
      } else {
        reset({
          name: '',
          description: '',
          image: '',
          parentId: '',
          displayOrder: 0,
          isActive: true,
        });
        setImagePreview('');
      }
    }
  }, [isOpen, category, reset]);

  // Get available parent categories (exclude current category and its descendants)
  const getAvailableParents = () => {
    if (!isEditing) return categories;
    
    // Build a set of category IDs to exclude (current category and its descendants)
    const excludeIds = new Set<string>();
    excludeIds.add(category.id);
    
    const addDescendants = (parentId: string) => {
      categories
        .filter(cat => cat.parentId === parentId)
        .forEach(child => {
          excludeIds.add(child.id);
          addDescendants(child.id);
        });
    };
    
    addDescendants(category.id);
    
    return categories.filter(cat => !excludeIds.has(cat.id));
  };

  const availableParents = getAvailableParents();

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData: CreateCategoryData = {
        name: data.name,
        description: data.description || undefined,
        image: data.image || undefined,
        parentId: data.parentId || undefined,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive ?? true,
      };

      if (isEditing) {
        await updateCategory.mutateAsync({
          id: category.id,
          data: submitData
        });
      } else {
        await createCategory.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleImageRemove = () => {
    setValue('image', '');
    setImagePreview('');
  };

  const handleImageError = () => {
    setImagePreview('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category description"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              {...register('parentId')}
              id="parentId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Parent (Root Category)</option>
              {availableParents.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="text-red-600 text-sm mt-1">{errors.parentId.message}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Category Image
            </label>
            <div className="space-y-2">
              <input
                {...register('image')}
                type="url"
                id="image"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URL"
              />
              {errors.image && (
                <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
              )}
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-20 h-20 object-cover rounded-md border border-gray-300"
                    onError={handleImageError}
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {!imagePreview && (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              {...register('displayOrder', { valueAsNumber: true })}
              type="number"
              id="displayOrder"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            {errors.displayOrder && (
              <p className="text-red-600 text-sm mt-1">{errors.displayOrder.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              <span>{isEditing ? 'Update' : 'Create'} Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}