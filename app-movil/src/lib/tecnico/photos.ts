// Port de src/lib/tecnico/photos.ts de la web (2026-11-07). Diferencia: la imagen se guarda como archivo, no como Blob.
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { Almacen } from "@/lib/offline/almacen";
import { nuevoId } from "@/lib/id";
import { JPEG_QUALITY, fitWithin } from "@/lib/offline/compress";
import { photoPath } from "./draft";

function carpetaFotos(): Directory {
  const dir = new Directory(Paths.document, "fotos");
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/**
 * Comprime una foto (JPEG, lado mayor 1600 px) y la guarda como archivo en el teléfono. Devuelve su id (UUID).
 * Al redibujarla se pierden los metadatos EXIF (ubicación GPS, modelo del teléfono), igual que en la web.
 */
export async function savePhoto(
  almacen: Almacen,
  userId: string,
  inspectionId: string,
  origen: { uri: string; width: number; height: number },
): Promise<string> {
  const { width } = fitWithin(origen.width, origen.height);
  const contexto = ImageManipulator.manipulate(origen.uri);
  const imagen = await contexto.resize({ width }).renderAsync();
  const resultado = await imagen.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

  const id = nuevoId();
  const destino = new File(carpetaFotos(), `${id}.jpg`);
  new File(resultado.uri).move(destino);
  await almacen.agregarFoto({
    id,
    inspectionId,
    uri: destino.uri,
    mime: "image/jpeg",
    sizeBytes: destino.size,
    storagePath: photoPath(userId, inspectionId, id, "jpg"),
    uploaded: false,
  });
  return id;
}

/** Guarda la firma dibujada (PNG en base64, sin recomprimir). */
export async function saveSignature(
  almacen: Almacen,
  userId: string,
  inspectionId: string,
  pngBase64: string,
): Promise<string> {
  const id = nuevoId();
  const destino = new File(carpetaFotos(), `${id}.png`);
  destino.create();
  destino.write(pngBase64.replace(/^data:image\/png;base64,/, ""), { encoding: "base64" });
  await almacen.agregarFoto({
    id,
    inspectionId,
    uri: destino.uri,
    mime: "image/png",
    sizeBytes: destino.size,
    storagePath: photoPath(userId, inspectionId, id, "png"),
    uploaded: false,
  });
  return id;
}

export async function deletePhoto(almacen: Almacen, id: string): Promise<void> {
  await almacen.eliminarFotos([id]);
}
