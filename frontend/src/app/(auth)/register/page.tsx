'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { cadastrar } = useAuth();
  const router = useRouter();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(dados: RegisterFormValues) {
    setErroGeral(null);
    try {
      await cadastrar(dados);
      router.push('/tickets');
    } catch (erro) {
      setErroGeral(erro instanceof ApiError ? erro.message : 'Não foi possível criar sua conta.');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink-900">Criar conta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input label="Nome" autoComplete="name" erro={errors.nome?.message} {...register('nome')} />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          erro={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          auxilio="Mínimo 8 caracteres, com maiúscula, minúscula e número."
          erro={errors.senha?.message}
          {...register('senha')}
        />

        {erroGeral && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroGeral}
          </p>
        )}

        <Button type="submit" carregando={isSubmitting} className="mt-2 w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-signal-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
