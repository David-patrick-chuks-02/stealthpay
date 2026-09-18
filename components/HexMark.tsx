import { Hexagon } from "@phosphor-icons/react/dist/ssr";

export function HexMark({ className = "h-7 w-7" }: { className?: string }) {
  return <Hexagon className={className} weight="fill" aria-hidden="true" />;
}
