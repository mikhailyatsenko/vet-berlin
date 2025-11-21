import LoadingExamples from '@/components/LoadingExamples';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loading Examples - Veterinarian Directory',
  description: 'Examples of loading states and UI patterns',
};

export default function LoadingExamplesPage() {
  return <LoadingExamples />;
}