import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLogin } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => login.mutate(data);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-text-primary">
              Jobylo Admin
            </CardTitle>
            <p className="text-text-secondary text-sm mt-1">
              Connectez-vous à votre tableau de bord
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-error' : ''}
                />
                {errors.email && (
                  <p className="text-error text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-error pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint hover:text-text-secondary"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {login.isError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-error text-sm bg-red-50 p-2 rounded"
                >
                  {login.error instanceof Error
                    ? login.error.message
                    : 'Identifiants incorrects'}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}