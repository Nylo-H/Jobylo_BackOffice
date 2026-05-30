import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, Shield, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { useUser } from '../../hooks/use-users';
import { formatDate, getInitials } from '../../lib/utils';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Utilisateur non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/users')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/users')}>
        <ArrowLeft size={16} className="mr-2" />
        Retour aux utilisateurs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar
              className="h-20 w-20 mx-auto mb-4"
              fallback={getInitials(user.username)}
            />
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-text-secondary text-sm">{user.email}</p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              {user.verified && (
                <Badge variant="success">
                  <BadgeCheck size={12} className="mr-1" /> Vérifié
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Nom complet</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Rôle</p>
                <p className="font-medium flex items-center gap-1">
                  <Shield size={14} /> {user.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Compte créé le</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar size={14} /> {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Statut KYC</p>
                <Badge
                  variant={
                    user.kycStatus === 'VERIFIED'
                      ? 'success'
                      : user.kycStatus === 'PENDING'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {user.kycStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}