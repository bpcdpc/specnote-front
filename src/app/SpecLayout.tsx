import { Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer";

// SpecDetail
//
// h-dvh: 화면 높이에 딱 맞춘다. 페이지 전체 스크롤은 없고 각 컬럼만 스크롤한다.
//   (100vh 대신 100dvh — 모바일 브라우저에서 100vh는 주소창을 포함한 값이라
//    실제 보이는 높이보다 커서 화면 아래가 잘린다.)
//
// 헤더와 3컬럼의 높이 배분은 flex가 처리한다.
// 헤더가 모바일에서 2행(약 96px)이 되어도 3컬럼이 남는 높이를 자동으로 차지한다.
// 계산식을 하드코딩하지 않는다.
export function SpecLayout() {
  return (
    <div className="flex h-dvh flex-col bg-surface-2">
      <Outlet />
      <Footer align="left" />
    </div>
  );
}
