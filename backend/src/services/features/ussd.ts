import { query } from "../../db/pool.js";
import { searchNearbyHouses } from "../houses.js";

type UssdSession = { step: string; data: Record<string, unknown> };

export async function handleUssdRequest(params: {
  sessionId: string;
  phone: string;
  text: string;
}): Promise<string> {
  const { sessionId, phone, text } = params;
  const input = text.trim();
  const parts = input.split("*").filter(Boolean);
  const lastInput = parts[parts.length - 1] ?? "";

  let session = await getUssdSession(sessionId);
  if (!session) {
    session = { step: "menu", data: {} };
  }

  switch (session.step) {
    case "menu": {
      if (lastInput === "1") {
        await saveUssdSession(sessionId, phone, { step: "search_area", data: {} });
        return "CON Quartier (ex. Gombe, Ngaliema):\n";
      }
      if (lastInput === "2") {
        await saveUssdSession(sessionId, phone, { step: "list_type", data: {} });
        return "CON Publier un bien:\n1.Chambre 2.Studio 3.3p 4.Villa\n";
      }
      return (
        "CON Bienvenue sur Casa Congo\n" +
        "1. Chercher un logement\n" +
        "2. Publier un bien\n" +
        "Pour plus, utilisez l'app Casa Congo ou WhatsApp.\n"
      );
    }

    case "search_area": {
      const area = lastInput.toLowerCase();
      // Default: Kinshasa Gombe
      let lat = -4.3053,
        lon = 15.3104;
      if (area.includes("gombe") || area.includes("kinshasa") || area.includes("ngaliema")) {
        lat = -4.3053;
        lon = 15.3104;
      } else if (area.includes("lubumbashi") || area.includes("kampemba")) {
        lat = -11.6642;
        lon = 27.4794;
      } else if (area.includes("goma")) {
        lat = -1.6770;
        lon = 29.2285;
      }
      const results = await searchNearbyHouses(lat, lon, 10);
      if (results.length === 0) {
        await saveUssdSession(sessionId, phone, { step: "menu", data: {} });
        return "END Aucun logement. Essayez WhatsApp.\n";
      }
      const list = results
        .slice(0, 3)
        .map((h, i) => `${i + 1}.${h.house_id} ${h.rent}CDF`)
        .join(" ");
      await saveUssdSession(sessionId, phone, { step: "menu", data: {} });
      return `END Trouvé: ${list}\nWhatsApp pour débloquer le contact.\n`;
    }

    case "list_type": {
      const types = ["single_room", "studio", "two_bedroom", "bungalow"];
      const idx = parseInt(lastInput, 10) - 1;
      if (idx < 0 || idx > 3) return "CON Invalide. Entrez 1-4:\n";
      await saveUssdSession(sessionId, phone, {
        step: "list_rent",
        data: { type: types[idx] },
      });
      return "CON Loyer mensuel en CDF:\n";
    }

    case "list_rent": {
      const rent = parseInt(lastInput.replace(/\D/g, ""), 10);
      if (!rent) return "CON Loyer invalide. Réessayez:\n";
      await saveUssdSession(sessionId, phone, { step: "menu", data: {} });
      return "END Pour publier sur Casa, utilisez WhatsApp : pièce d'identité + vidéo requises.\n";
    }

    default:
      await saveUssdSession(sessionId, phone, { step: "menu", data: {} });
      return "CON Bienvenue sur Casa\n1.Chercher 2.Publier\n";
  }
}

async function getUssdSession(sessionId: string): Promise<UssdSession | null> {
  const result = await query<{ step: string; data: Record<string, unknown> }>(
    `SELECT step, data FROM ussd_sessions WHERE session_id = $1`,
    [sessionId]
  );
  if (!result.rows[0]) return null;
  return { step: result.rows[0].step, data: result.rows[0].data };
}

async function saveUssdSession(
  sessionId: string,
  phone: string,
  session: UssdSession
): Promise<void> {
  await query(
    `INSERT INTO ussd_sessions (session_id, phone, step, data, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (session_id) DO UPDATE SET
       step = EXCLUDED.step, data = EXCLUDED.data, updated_at = NOW()`,
    [sessionId, phone, session.step, JSON.stringify(session.data)]
  );
}
