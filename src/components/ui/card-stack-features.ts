// The animation features the card stack needs (drag and tap). They live in their own file so the
// stack can load them after the page is up (see LazyMotion in interactive-card-stack.tsx) instead of
// adding them to every visitor's first download.
export { domMax as default } from "framer-motion";
