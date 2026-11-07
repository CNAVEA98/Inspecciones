import { describe, expect, it } from "vitest";
import { nombreDeRuta, reubicarUri } from "./ruta";

describe("rutas de archivos locales", () => {
  it("extrae el nombre del archivo", () => {
    expect(nombreDeRuta("file:///var/mobile/Containers/Data/Application/AAA/Documents/fotos/abc.jpg")).toBe("abc.jpg");
    expect(nombreDeRuta("abc.png")).toBe("abc.png");
    expect(nombreDeRuta("file:///x/y/abc.jpg?v=2")).toBe("abc.jpg");
  });

  it("reubica la foto en la carpeta vigente aunque cambie el contenedor de la app", () => {
    const vieja = "file:///var/mobile/Containers/Data/Application/AAA/Documents/fotos/abc.jpg";
    expect(reubicarUri(vieja, "file:///var/mobile/Containers/Data/Application/BBB/Documents/fotos/")).toBe(
      "file:///var/mobile/Containers/Data/Application/BBB/Documents/fotos/abc.jpg",
    );
    expect(reubicarUri(vieja, "file:///nuevo/fotos")).toBe("file:///nuevo/fotos/abc.jpg");
  });

  it("no toca una ruta sin nombre de archivo", () => {
    expect(reubicarUri("file:///x/", "file:///nuevo/fotos")).toBe("file:///x/");
  });
});
