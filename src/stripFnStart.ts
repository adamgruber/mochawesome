/**
 * Strip start of function
 */
function stripFunctionStart(input: string): string {
  const BEGIN = 1;
  const LBRACE = 2;
  const EQ = 4;
  const ARROW = 8;
  const ARROW_LBRACE = 16;
  const ARROW_PAREN = 32;
  const DONE = 64;

  const isWhitespace = (ch: string) => ch === ' ' || ch === '\t' || ch === '\n';

  const nextState = (state: number, c: string) => {
    switch (state) {
      case BEGIN:
        switch (c) {
          case '{':
            return LBRACE;
          case '=':
            return EQ;
          default:
            return BEGIN;
        }

      case LBRACE:
        return c === ' ' ? LBRACE : DONE;

      case EQ:
        return c === '>' ? ARROW : BEGIN;

      case ARROW:
        if (isWhitespace(c)) return ARROW;
        switch (c) {
          case '{':
            return ARROW_LBRACE;
          case '(':
            return ARROW_PAREN;
          default:
            return DONE;
        }

      case ARROW_LBRACE:
      case ARROW_PAREN:
        return DONE;

      default:
        return DONE;
    }
  };

  let state = BEGIN;
  let pos = 0;
  while (pos < input.length && state !== DONE) {
    state = nextState(state, input.charAt(pos));
    pos += 1;
  }
  return state === DONE ? input.slice(pos - 1) : input;
}

export default stripFunctionStart;
