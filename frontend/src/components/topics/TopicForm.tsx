'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { topicSchema, type TopicFormData } from '@/lib/validations';
import { Topic } from '@/types';
import { Loader2 } from 'lucide-react';

interface TopicFormProps { onSubmit: (data: TopicFormData) => Promise<void>; defaultValues?: Partial<Topic>; submitLabel?: string; }

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];

export default function TopicForm({ onSubmit, defaultValues, submitLabel = 'Simpan' }: TopicFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: defaultValues?.title || '', description: defaultValues?.description || '', category: defaultValues?.category || '', color: defaultValues?.color || '#6366f1' },
  });
  const selectedColor = watch('color');
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Topik *</Label>
        <Input id="title" placeholder="mis. Matematika, Bahasa Inggris..." {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" placeholder="Deskripsi singkat topik..." rows={3} {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Input id="category" placeholder="mis. Sains, Bahasa, Teknologi..." {...register('category')} />
      </div>
      <div className="space-y-2">
        <Label>Warna</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setValue('color', c)}
              className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : submitLabel}
      </Button>
    </form>
  );
}
