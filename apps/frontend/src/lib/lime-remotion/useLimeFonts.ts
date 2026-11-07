import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export function useLimeFontsReady() {
  const [fontHandle] = useState(() => delayRender("Load Lime Slides fonts"));
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`, { weight: "400" }),
      new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-Variable.ttf")})`, { weight: "100 900" }),
      new FontFace("Montserrat ExtraBold", `url(${staticFile("fonts/Montserrat-ExtraBold.ttf")})`, { weight: "800" }),
    ];
    Promise.all(faces.map((face) => face.load()))
      .then((loaded) => {
        loaded.forEach((face) => document.fonts.add(face));
        return document.fonts.ready;
      })
      .then(() => {
        if (cancelled) return;
        if (!document.fonts.check('400 16px "Anton"') || !document.fonts.check('800 16px "Montserrat ExtraBold"')) {
          throw new Error("Lime Slides bundled fonts failed document.fonts.check().");
        }
        setFontsReady(true);
        continueRender(fontHandle);
      })
      .catch((error) => {
        if (!cancelled) cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
    return () => { cancelled = true; };
  }, [fontHandle]);
  return fontsReady;
}
