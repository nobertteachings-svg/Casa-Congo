const { withAppBuildGradle, withMainApplication } = require("expo/config-plugins");

function withAndroidModernTls(config) {
  config = withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes("conscrypt-android")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {
    implementation "org.conscrypt:conscrypt-android:2.5.3"`
      );
    }
    return mod;
  });

  config = withMainApplication(config, (mod) => {
    let src = mod.modResults.contents;
    if (src.includes("Conscrypt.newProvider")) return mod;

    if (src.includes("fun onCreate")) {
      if (!src.includes("import org.conscrypt.Conscrypt")) {
        src = src.replace(
          /(^package [^\n]+\n)/m,
          `$1import org.conscrypt.Conscrypt\nimport java.security.Security\n`
        );
      }
      src = src.replace(
        /super\.onCreate\(\)/,
        `super.onCreate()
    try {
      Security.insertProviderAt(Conscrypt.newProvider(), 1)
    } catch (_: Throwable) {}`
      );
    } else {
      if (!src.includes("import org.conscrypt.Conscrypt")) {
        src = src.replace(
          /(^package [^\n]+\n)/m,
          `$1import org.conscrypt.Conscrypt;\nimport java.security.Security;\n`
        );
      }
      src = src.replace(
        /super\.onCreate\(\);/,
        `super.onCreate();
    try {
      Security.insertProviderAt(Conscrypt.newProvider(), 1);
    } catch (Throwable ignored) {}`
      );
    }
    mod.modResults.contents = src;
    return mod;
  });

  return config;
}

module.exports = withAndroidModernTls;
