export function LoadingState({ label = "불러오는 중…" }: { label?: string }) {
  return <p className="pt-16 text-center text-sm text-fg-3">{label}</p>;
}
