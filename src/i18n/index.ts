import ro from './ro.json';
import pl from './pl.json';
import lt from './lt.json';
import uk from './uk.json';
import ru from './ru.json';
import pt from './pt.json';
import fr from './fr.json';
import it from './it.json';
import es from './es.json';
import ga from './ga.json';
import fil from './fil.json';
import type { LangCode } from './languages';

// English text -> translation. English is always the key and always shown; the translation sits beneath it.
// Keys with {0}, {1} are templates for text that contains names, counts or dates.
export const DICTIONARIES: Record<LangCode, Record<string, string>> = { ro, pl, lt, uk, ru, pt, fr, it, es, ga, fil };
