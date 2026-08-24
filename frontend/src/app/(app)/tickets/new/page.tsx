'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarTicketFormSchema, type CriarTicketFormValues } from '@/schemas/ticket.schema';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { PRIORIDADE_LABEL } from '@/lib/constants';
import type { Categoria, Ticket } from '@/types';

export default function NovoChamadoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CriarTicketFormValues>({
    resolver: zodResolver(criarTicketFormSchema),
    defaultValues: { prioridade: 'media' },
  });

  useEffect(() => {
    api
      .get<{ categorias: Categoria[] }>('/categories')
      .then((resposta) => setCategorias(resposta.categorias))
      .catch(() => setCategorias([]));
  }, []);

  async function onSubmit(dados: CriarTicketFormValues) {
    setErroGeral(null);
    try {
      const { ticket } = await api.post<{ ticket: Ticket }>('/tickets', dados);
      router.push(`/tickets/${ticket._id}`);
    } catch (erro) {
      setErroGeral(erro instanceof ApiError ? erro.message : 'Não foi possível abrir o chamado.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl">Abrir novo chamado</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Título"
            placeholder="Ex: Impressora do 3º andar não imprime"
            erro={errors.titulo?.message}
            {...register('titulo')}
          />

          <Textarea
            label="Descrição"
            rows={5}
            placeholder="Descreva o problema com o máximo de detalhes possível."
            erro={errors.descricao?.message}
            {...register('descricao')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Categoria"
              erro={errors.categoria?.message}
              defaultValue=""
              disabled={categorias === null}
              {...register('categoria')}
            >
              <option value="" disabled>
                {categorias === null ? 'Carregando...' : 'Selecione'}
              </option>
              {categorias?.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>
                  {categoria.nome}
                </option>
              ))}
            </Select>

            <Select label="Prioridade" erro={errors.prioridade?.message} {...register('prioridade')}>
              {Object.entries(PRIORIDADE_LABEL).map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {categorias?.length === 0 && (
            <p className="text-sm text-ink-400">
              Nenhuma categoria cadastrada ainda. Peça a um técnico para cadastrar uma categoria.
            </p>
          )}

          {erroGeral && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroGeral}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" carregando={isSubmitting} disabled={!categorias?.length}>
              Abrir chamado
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
