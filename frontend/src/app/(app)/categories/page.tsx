'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { categoriaFormSchema, type CategoriaFormValues } from '@/schemas/category.schema';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { CarregandoTela, EstadoErro } from '@/components/ui/States';
import type { Categoria } from '@/types';

export default function CategoriasPage() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaFormValues>({ resolver: zodResolver(categoriaFormSchema) });

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const resposta = await api.get<{ categorias: Categoria[] }>('/categories');
      setCategorias(resposta.categorias);
    } catch (erroCapturado) {
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : 'Não foi possível carregar as categorias.');
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function onSubmit(dados: CategoriaFormValues) {
    setErroForm(null);
    try {
      await api.post('/categories', dados);
      reset();
      await carregar();
    } catch (erroCapturado) {
      setErroForm(erroCapturado instanceof ApiError ? erroCapturado.message : 'Não foi possível criar a categoria.');
    }
  }

  async function alternarAtivo(categoria: Categoria) {
    await api.patch(`/categories/${categoria._id}`, { ativo: !categoria.ativo });
    await carregar();
  }

  if (usuario?.papel !== 'tecnico') {
    return <EstadoErro mensagem="Apenas técnicos podem gerenciar categorias." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-ink-800">Nova categoria</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input label="Nome" erro={errors.nome?.message} {...register('nome')} />
            <Textarea label="Descrição" rows={3} erro={errors.descricao?.message} {...register('descricao')} />
            {erroForm && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {erroForm}
              </p>
            )}
            <Button type="submit" carregando={isSubmitting}>
              Criar categoria
            </Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl">Categorias</h1>

        {categorias === null && !erro && <CarregandoTela mensagem="Carregando categorias..." />}
        {erro && <EstadoErro mensagem={erro} tentarNovamente={carregar} />}

        {categorias && (
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {categorias.map((categoria) => (
                  <tr key={categoria._id}>
                    <td className="px-4 py-3 font-medium text-ink-800">{categoria.nome}</td>
                    <td className="px-4 py-3 text-ink-500">{categoria.descricao || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          categoria.ativo
                            ? 'rounded-full bg-status-resolvido-bg px-2.5 py-1 text-xs font-medium text-status-resolvido'
                            : 'rounded-full bg-status-fechado-bg px-2.5 py-1 text-xs font-medium text-status-fechado'
                        }
                      >
                        {categoria.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => alternarAtivo(categoria)}>
                        {categoria.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
