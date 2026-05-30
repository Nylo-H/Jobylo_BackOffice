import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy HH:mm') {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatPrice(amount: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}