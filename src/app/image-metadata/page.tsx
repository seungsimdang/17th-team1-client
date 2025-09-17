import ImageMetadata from "@/components/image-metadata/ImageMetadata";

interface PageProps {
  searchParams: { city?: string };
}

export default function Page({ searchParams }: PageProps) {
  return <ImageMetadata initialCity={searchParams.city} />;
}
