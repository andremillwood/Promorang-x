import type { Locale } from "./translations";

export const eventScheduleCopy: Record<Locale, Record<"timezone" | "invalid_time" | "invalid_timezone" | "nonexistent_time" | "ambiguous_time" | "end_before_start", string>> = {
  en: {
    timezone: "Event timezone",
    invalid_time: "Enter a valid event date and time.",
    invalid_timezone: "The event timezone is invalid. Correct it before changing the schedule.",
    nonexistent_time: "This local time does not exist because the clocks move forward. Choose another time.",
    ambiguous_time: "This local time occurs twice when the clocks move back. Choose an unambiguous time or ask support to set the exact occurrence.",
    end_before_start: "The event end must be after its start.",
  },
  "es-419": {
    timezone: "Zona horaria del evento",
    invalid_time: "Introduce una fecha y hora válidas para el evento.",
    invalid_timezone: "La zona horaria del evento no es válida. Corrígela antes de cambiar el horario.",
    nonexistent_time: "Esta hora local no existe porque se adelanta el reloj. Elige otra hora.",
    ambiguous_time: "Esta hora local ocurre dos veces cuando se atrasa el reloj. Elige otra hora o pide a soporte que configure la ocurrencia exacta.",
    end_before_start: "El evento debe terminar después de su inicio.",
  },
  "pt-BR": {
    timezone: "Fuso horário do evento",
    invalid_time: "Informe uma data e hora válidas para o evento.",
    invalid_timezone: "O fuso horário do evento é inválido. Corrija-o antes de alterar a programação.",
    nonexistent_time: "Este horário local não existe porque o relógio avança. Escolha outro horário.",
    ambiguous_time: "Este horário local ocorre duas vezes quando o relógio retrocede. Escolha outro horário ou peça ao suporte para definir a ocorrência exata.",
    end_before_start: "O evento deve terminar depois do início.",
  },
};
