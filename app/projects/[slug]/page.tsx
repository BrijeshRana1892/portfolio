import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import CaseStudyView from './CaseStudyView';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: project.title,
    description: project.oneLiner,
    openGraph: {
      title: `${project.title} · Brijesh Rana`,
      description: project.oneLiner,
      url: `https://brijeshrana.dev/projects/${project.slug}`,
    },
    alternates: {
      canonical: `https://brijeshrana.dev/projects/${project.slug}`,
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();
  return <CaseStudyView project={project} />;
}
