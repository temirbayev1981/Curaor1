import Link from 'next/link';
import { NotFoundContent } from '@/components/errors/NotFoundContent';

export default function NotFound() {
  return (
    <NotFoundContent locale="en" />
  );
}
