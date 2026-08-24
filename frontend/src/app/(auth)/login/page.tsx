'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(dados: LoginFormValues) {
    setErroGeral(null);
    try {
      await entrar(dados);
      router.push('/tickets');
    } catch (erro) {
      setErroGeral(erro instanceof ApiError ? erro.message : 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink-900">Entrar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          erro={errors.senha?.message}
          {...register('senha')}
        />

        {erroGeral && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroGeral}
          </p>
        )}

        <Button type="submit" carregando={isSubmitting} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Ainda não tem conta?{' '}
        <Link href="/register" className="font-medium text-signal-700 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
