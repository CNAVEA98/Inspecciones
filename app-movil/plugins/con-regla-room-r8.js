// Plugin de configuración local (sin dependencias nuevas): agrega a android/app/proguard-rules.pro la regla que evita que R8
// borre el constructor de las bases Room de WorkManager (lo usa expo-background-task). Sin ella, la compilación release
// (R8 viene activado en el SDK 58) se cierra al abrir con «NoSuchMethodException WorkDatabase_Impl.<init>».
// Detectado el 2026-11-09 al compilar el APK local; afecta también a los builds de EAS.
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

const MARCA = "# inspecciones-mlp: Room (WorkManager)";
const REGLA = `${MARCA}\n-keep class * extends androidx.room.RoomDatabase { <init>(...); }\n`;

module.exports = function conReglaRoomR8(config) {
  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const archivo = path.join(cfg.modRequest.platformProjectRoot, "app", "proguard-rules.pro");
      const actual = fs.existsSync(archivo) ? fs.readFileSync(archivo, "utf8") : "";
      if (!actual.includes(MARCA)) fs.writeFileSync(archivo, `${actual.trimEnd()}\n\n${REGLA}`);
      return cfg;
    },
  ]);
};
