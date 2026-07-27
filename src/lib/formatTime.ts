const RTF = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

const UNITS = [
  { limit: 60, unit: "second" as const, ms: 1000 },
  { limit: 60, unit: "minute" as const, ms: 60_000 },
  { limit: 24, unit: "hour" as const, ms: 3_600_000 },
  { limit: 7, unit: "day" as const, ms: 86_400_000 },
];

// "3시간 전". 7일이 넘으면 절대 날짜로 떨어진다 —
// "5주 전" 같은 표현은 오히려 언제인지 감이 안 온다.
//
// 렌더 시점에 계산되므로 화면을 열어둔 채로는 갱신되지 않는다.
// 타이머를 붙일 값은 없다. 목록을 재조회할 때 같이 갱신된다.
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  for (const { limit, unit, ms } of UNITS) {
    const value = diff / ms;
    if (Math.abs(value) < limit) return RTF.format(-Math.round(value), unit);
  }

  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

// 툴팁용 전체 시각.
export function fullTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR");
}
