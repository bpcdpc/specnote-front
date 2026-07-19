import { Fragment } from "react";
import { Link } from "react-router-dom";

export type Crumb = {
  label: string;
  // 없으면 링크가 아닌 텍스트로 렌더한다.
  to?: string;
};

// Breadcrumb — 헤더 좌측 경로 표시
//
// 마지막 조각이 현재 화면이고 h1 이다(05-code-conventions 의 heading 계층).
// 앞선 조각은 링크다. 구분자 "/" 는 장식이라 aria-hidden 을 붙인다.
//
// <nav> 로 감싸지 않는다 — h1 이 nav 안에 들어가면 문서 아웃라인이 어색해진다.
// 조각이 최대 3개라 랜드마크로 노출할 이득이 없다.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <Fragment key={i}>
            {i > 0 && (
              <span aria-hidden="true" className="select-none text-fg-3">
                /
              </span>
            )}

            {/* 마지막 조각은 현재 화면이라 h1 이다.
              to 가 있으면 링크로 감싼다 — SpecLayout 처럼 마지막 조각이
              곧 프로젝트인 화면에서 자기 자신으로 돌아가는 경로가 된다. */}
            {isLast ? (
              <h1 className="min-w-0 truncate font-medium text-fg-1">
                {item.to ? (
                  <Link
                    to={item.to}
                    className="rounded-sm hover:text-fg-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </h1>
            ) : item.to ? (
              <Link
                to={item.to}
                className="shrink-0 rounded-sm text-fg-2 hover:text-fg-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ) : (
              <span className="shrink-0 text-fg-2">{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
