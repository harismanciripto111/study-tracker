'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const topicSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter').max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  targetHours: z.coerce.number().min(1).max(1000).optional(),
});

export type TopicFormData = z.infer<typeof topicSchema>;

const CATEGORIES = [
  { value: 'math', label: 'Matematika' },
  { value: 'science', label: 'Sains' },
  { value: 'language', label: 'Bahasa' },
  { value: 'history', label: 'Sejarah' },
  { value: 'programming', label: 'Pemrograman' },
  { value: 'other', label: 'Lainnya' },
];

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

interface TopicFormProps {
  defaultValues?: Partial<TopicFormData>;
  onSubmit: (data: TopicFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function TopicForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Simpan',
}: TopicFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      color: '#6366f1',
      targetHours: 10,
      ...defaultValues,
    },
  });

  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="title">Judul Topik *</Label>
        <Input
          id="title"
          placeholder="Contoh: Aljabar Linear"
          {...register('title')}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi singkat topik ini..."
          rows={3}
          {...register('description')}
        />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label>Kategori</Label>
        <Select
          defaultValue={defaultValues?.category || 'other'}
          onValueChange={(val) => setValue('category', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Hours */}
      <div className="space-y-1">
        <Label htmlFor="targetHours">Target Jam Belajar</Label>
        <Input
          id="targetHours"
          type="number"
          min={1}
          max={1000}
          placeholder="10"
          {...register('targetHours')}
          className={errors.targetHours ? 'border-red-500' : ''}
        />
        {errors.targetHours && (
          <p className="text-xs text-red-500">{errors.targetHours.message}</p>
        )}
      </div>

      {/* Color */}
      <div className="space-y-1">
        <Label>Warna</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-7 h-7 rounded-full transition-all ${
                selectedColor === color
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Menyimpan...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
