export type Role = "admin" | "supervisor" | "planner" | "technician";
export type Shift = "A" | "B";

export const ROLES: readonly Role[] = ["admin", "supervisor", "planner", "technician"];
export const SHIFTS: readonly Shift[] = ["A", "B"];

/** Cada rol tiene su propia área; el proxy y los layouts lo exigen. */
export const AREA_PATH: Record<Role, string> = {
  admin: "/admin",
  supervisor: "/supervisor",
  planner: "/planificador",
  technician: "/tecnico",
};

export const homeFor = (role: Role) => AREA_PATH[role];

/** Rol dueño de la ruta, o null si la ruta no es de un área protegida. */
export function roleOfPath(pathname: string): Role | null {
  for (const role of ROLES) {
    const base = AREA_PATH[role];
    if (pathname === base || pathname.startsWith(`${base}/`)) return role;
  }
  return null;
}

/** Solo se aceptan rutas internas de las áreas protegidas como destino posterior al login. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return roleOfPath(next) ? next : null;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  planner: "Programador",
  technician: "Técnico",
};

/** «Supervisor · Turno A»; el administrador no tiene turno. */
export function roleWithShift(role: Role, shift: Shift | null | undefined): string {
  return shift ? `${ROLE_LABEL[role]} · Turno ${shift}` : ROLE_LABEL[role];
}
