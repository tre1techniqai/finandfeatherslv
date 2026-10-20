"use client";

import MenuImageEditor from "@/components/admin/menu-image-editor";

type GalleryImageEditorProps = {
  initialImageUrl?: string | null;
  onSaveCrop: (file: File) => Promise<void> | void;
  onCancel?: () => void;
};

export default function GalleryImageEditor({
  initialImageUrl,
  onSaveCrop,
  onCancel,
}: GalleryImageEditorProps) {
  return (
    <MenuImageEditor
      initialImageUrl={initialImageUrl}
      onSaveCrop={onSaveCrop}
      onCancel={onCancel}
    />
  );
}