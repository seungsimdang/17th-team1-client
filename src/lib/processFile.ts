import { ImageMetadata } from "@/types/imageMetadata";
import exifr from "exifr";

async function getNearbyPlaces(lat: number, lng: number): Promise<string[]> {
  try {
    const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    return data.places || [];
  } catch {
    return [];
  }
}

export async function processSingleFile(file: File): Promise<ImageMetadata> {
  const id = Math.random().toString(36).substr(2, 9);
  const extracted: ImageMetadata = {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    imagePreview: URL.createObjectURL(file),
    status: "processing",
  };

  const isHeic =
    file.type.toLowerCase().includes("heic") || /\.heic$/i.test(file.name);
  if (isHeic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file as unknown as Blob,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      if (jpegBlob instanceof Blob) {
        // 메모리 누수 방지: 기존 Object URL 해제
        const newUrl = URL.createObjectURL(jpegBlob);
        URL.revokeObjectURL(extracted.imagePreview);
        extracted.imagePreview = newUrl;
      }
    } catch {
      try {
        const thumb = await exifr.thumbnail(file);
        if (thumb) {
          // Uint8Array를 새로운 Uint8Array로 복사하여 타입 안전성 확보
          const thumbArray = new Uint8Array(thumb);
          // 메모리 누수 방지: 기존 Object URL 해제
          const newUrl = URL.createObjectURL(
            new Blob([thumbArray], { type: "image/jpeg" })
          );
          URL.revokeObjectURL(extracted.imagePreview);
          extracted.imagePreview = newUrl;
        }
      } catch {}
    }
  }

  try {
    const exifData: any = await exifr.parse(file);
    if (exifData.ImageWidth && exifData.ImageHeight)
      extracted.dimensions = {
        width: exifData.ImageWidth,
        height: exifData.ImageHeight,
      };
    if (exifData.Make || exifData.Model || exifData.Software)
      extracted.camera = {
        make: exifData.Make || "",
        model: exifData.Model || "",
        software: exifData.Software || "",
      };
    if (
      exifData.ISO ||
      exifData.FNumber ||
      exifData.ExposureTime ||
      exifData.FocalLength ||
      exifData.Flash
    )
      extracted.settings = {
        iso: exifData.ISO || 0,
        aperture: exifData.FNumber || 0,
        shutterSpeed: exifData.ExposureTime
          ? `1/${Math.round(1 / exifData.ExposureTime)}s`
          : "",
        focalLength: exifData.FocalLength || 0,
        flash: exifData.Flash ? exifData.Flash !== 0 : false,
      };
    if (exifData.latitude && exifData.longitude) {
      const nearbyPlaces = await getNearbyPlaces(
        exifData.latitude,
        exifData.longitude
      );
      let address = `${exifData.latitude.toFixed(
        4
      )}, ${exifData.longitude.toFixed(4)}`;
      try {
        const addressResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${exifData.latitude},${exifData.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr`
        );
        const addressData = await addressResponse.json();
        if (addressData.results && addressData.results.length > 0)
          address = addressData.results[0].formatted_address;
      } catch {}
      extracted.location = {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        altitude: exifData.altitude,
        address,
        nearbyPlaces: [address, ...nearbyPlaces],
      };
    }
    if (exifData.DateTimeOriginal)
      extracted.timestamp = new Date(exifData.DateTimeOriginal).toISOString();
    if (exifData.Orientation) extracted.orientation = exifData.Orientation;
    extracted.status = "completed";
    return extracted;
  } catch (e: any) {
    extracted.status = "error";
    extracted.error = e?.message || "알 수 없는 오류";
    return extracted;
  }
}
