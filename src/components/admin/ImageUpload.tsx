"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "@/components/site/ToastHost";

/**
 * Image picker that uploads straight to the Apps Script backend:
 *
 *   <input type=file>
 *     → FileReader.readAsDataURL (base64 data-URL)
 *     → POST /api/admin/upload  { filename, base64 }
 *     → Next.js forwards to Apps Script with the shared ADMIN_KEY
 *     → Apps Script drops the file in Drive and returns { url }
 *     → We surface the URL back to the parent <ProductForm>
 *
 * The product cannot be saved until the upload succeeds and a URL is
 * attached to the draft — that guard lives in ProductForm.save().
 */
export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("فشل قراءة الملف"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("يجب اختيار ملف صورة", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("الصورة كبيرة جداً (الحد الأقصى 5 ميغا)", "error");
      return;
    }

    setUploading(true);
    try {
      const base64 = await readAsBase64(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, base64 }),
      });
      const json = (await res.json()) as {
        success: boolean;
        url?: string;
        error?: string;
      };
      if (!json.success || !json.url) {
        throw new Error(json.error || "فشل رفع الصورة");
      }
      onChange(json.url);
      toast("تم رفع الصورة", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-white/10"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      {value ? (
        <Image
          src={value}
          alt="product"
          fill
          sizes="220px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/50">
          <div className="text-3xl">🖼</div>
          <div className="text-xs">اسحب صورة أو انقر لاختيارها</div>
        </div>
      )}

      <button
        type="button"
        onClick={pick}
        disabled={uploading}
        className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent p-3 opacity-0 transition hover:opacity-100 disabled:opacity-60"
      >
        <span className="btn btn-primary !px-4 !py-2 !text-xs">
          {uploading ? "جارٍ الرفع…" : value ? "تغيير الصورة" : "رفع صورة"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading && (
        <div className="absolute inset-x-0 bottom-0 h-1 animate-shimmer bg-gradient-to-l from-transparent via-gold to-transparent bg-[length:200%_100%]" />
      )}
    </div>
  );
}
