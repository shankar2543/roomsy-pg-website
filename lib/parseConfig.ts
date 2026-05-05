import Parse from "parse";

let initialized = false;

export function initParse() {
  if (initialized) return;
  Parse.initialize(
    process.env.NEXT_PUBLIC_BACK4APP_APP_ID!,
    process.env.NEXT_PUBLIC_BACK4APP_JS_KEY!
  );
  (Parse as any).serverURL = process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL!;
  initialized = true;
}

export default Parse;
