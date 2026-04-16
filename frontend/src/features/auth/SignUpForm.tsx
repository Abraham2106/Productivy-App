import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';

import { useAuth } from './useAuth';

interface SignUpFormProps {
  onSwitchMode: () => void;
}

export default function SignUpForm({ onSwitchMode }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccessMessage(
        'Cuenta creada. Revisa tu bandeja y confirma tu direccion de e-mail.'
      );
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : 'No pudimos crear la cuenta.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="section-label mb-2 block">Nombre</label>
        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95A5A6]"
          />
          <input
            type="text"
            autoComplete="name"
            className="input-field pl-11"
            placeholder="Como quieres aparecer"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="section-label mb-2 block">Email</label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95A5A6]"
          />
          <input
            type="email"
            autoComplete="email"
            className="input-field pl-11"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="section-label mb-2 block">Password</label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95A5A6]"
          />
          <input
            type="password"
            autoComplete="new-password"
            className="input-field pl-11"
            placeholder="Minimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#E24B4A]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-[#2ECC71]/20 bg-[#EAF7EE] px-4 py-3 text-sm text-[#1F8A57]">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-[#6C757D]">
        Si ya tienes cuenta,{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="font-semibold text-[#27AE60] transition-colors hover:text-[#1F8A57]"
        >
          inicia sesion
        </button>
        .
      </p>
    </form>
  );
}
