'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { comentarioFormSchema, type ComentarioFormValues } from '@/schemas/ticket.schema';
import { Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export function CommentForm({ aoEnviar }: { aoEnviar: (texto: string) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComentarioFormValues>({ resolver: zodResolver(comentarioFormSchema) });

  async function onSubmit(dados: ComentarioFormValues) {
    await aoEnviar(dados.texto);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <Textarea
        label="Adicionar comentário"
        rows={3}
        placeholder="Escreva uma atualização ou pergunta sobre este chamado..."
        erro={errors.texto?.message}
        {...register('texto')}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" carregando={isSubmitting}>
          Comentar
        </Button>
      </div>
    </form>
  );
}
