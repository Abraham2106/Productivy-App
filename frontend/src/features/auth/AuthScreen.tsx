import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Sprout, TrendingUp } from 'lucide-react';

import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

type AuthMode = 'login' | 'signup';

const HIGHLIGHTS = [
  {
    title: 'Tu progreso queda ligado a tu cuenta',
    description: 'Cada tarea, metrica y score se guarda bajo tu identidad real en Supabase.',
    Icon: ShieldCheck,
  },
  {
    title: 'Seguimiento semanal listo para comparar',
    description: 'La vista semanal y los habitos detectados usan tus propios datos del ultimo mes.',
    Icon: TrendingUp,
  },
  {
    title: 'La app recuerda tu sesion',
    description: 'Al volver a abrir la pagina, recuperamos la sesion automaticamente.',
    Icon: CheckCircle2,
  },
];

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,204,113,0.18),_transparent_36%),linear-gradient(180deg,#F4FBF6_0%,#F8F9FA_38%,#EFF4F1_100%)] px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[32px] border-2 border-[#E2EEE5] bg-[#F5FBF6] p-6 shadow-sm lg:p-10"
        >
          <div className="absolute right-[-80px] top-[-60px] h-56 w-56 rounded-full bg-[#2ECC71]/10 blur-3xl" />
          <div className="absolute bottom-[-90px] left-[-30px] h-48 w-48 rounded-full bg-[#27AE60]/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#2ECC71]/15 bg-white/90 px-4 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-lg text-white shadow-sm">
                <Sprout size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2C3E50]">Growth</p>
                <p className="text-xs text-[#6C757D]">Sprint 2.5 · Auth + multiusuario</p>
              </div>
            </div>

            <div className="mt-8 max-w-[560px]">
              <p className="section-label mb-3">Cuenta personal</p>
              <h1 className="text-3xl font-bold leading-tight text-[#2C3E50] lg:text-5xl">
                Entra con tu cuenta y trabaja sobre tus propios habitos.
              </h1>
              <p className="mt-4 max-w-[520px] text-base leading-7 text-[#6C757D]">
                Esta version deja atras el usuario local fijo y conecta la app con identidad real
                de Supabase para que cada sesion mantenga sus datos separados.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {HIGHLIGHTS.map(({ title, description, Icon }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-[#E2EEE5] bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EAF7EE] text-[#27AE60]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2C3E50]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#6C757D]">{description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-[32px] border-2 border-[#E9ECEF] bg-white p-6 shadow-xl lg:p-8"
        >
          <div className="mb-6 flex rounded-2xl bg-[#F8F9FA] p-1.5">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2C3E50] shadow-sm'
                  : 'text-[#6C757D] hover:text-[#2C3E50]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#2C3E50] shadow-sm'
                  : 'text-[#6C757D] hover:text-[#2C3E50]'
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mb-6">
            <p className="section-label mb-2">{mode === 'login' ? 'Sesion existente' : 'Registro'}</p>
            <h2 className="text-2xl font-bold text-[#2C3E50]">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu espacio personal'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6C757D]">
              {mode === 'login'
                ? 'Usa tu email y password para seguir desde donde lo dejaste.'
                : 'Tu nombre se usara como perfil base en public.users al registrarte.'}
            </p>
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitchMode={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitchMode={() => setMode('login')} />
          )}
        </motion.section>
      </div>
    </div>
  );
}
