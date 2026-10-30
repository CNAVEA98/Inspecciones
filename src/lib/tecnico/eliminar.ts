import type { MlpDB } from "@/lib/offline/db";

/**
 * Elimina un borrador que todavía no se envió (p. ej. uno abierto sin querer), con sus fotos y firmas del equipo.
 * Solo borra lo local: un borrador no existe en el servidor hasta que se envía. Una inspección en cola o ya
 * enviada no se puede eliminar desde aquí. -> true si se eliminó.
 */
export async function eliminarBorrador(db: MlpDB, id: string): Promise<boolean> {
  return db.transaction("rw", db.drafts, db.photos, async () => {
    const draft = await db.drafts.get(id);
    if (!draft || draft.state !== "draft") return false;
    await db.photos.where("inspectionId").equals(id).delete();
    await db.drafts.delete(id);
    return true;
  });
}
