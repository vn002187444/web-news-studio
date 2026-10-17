import ContactClient from './ContactClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên Hệ Tòa Soạn',
  description: 'Liên hệ với đội ngũ NewsStudio.',
};

export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }];
}

export default function ContactPage() {
  return <ContactClient />;
}
