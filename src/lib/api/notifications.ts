import type { Notification, NotificationView } from "../types";
import { api } from "./client";

// GET  /api/notifications
// →  NotificationView[]  (recipientId 본인 것만, 최신순 desc)
//
// 페이지네이션이 없다. 계정 수명 전체의 알림이 전부 온다 —
// 드롭다운이 표시 건수를 자른다.
export function getNotifications() {
  return api.get<NotificationView[]>("/notifications");
}

// PATCH /api/notifications/:id/read
// →  Notification  (원형. 목록 재조회로 화면을 갱신한다)
//
// 멱등이다. 이미 읽은 알림에 다시 보내도 200 이다 — 화면이 미리 걸러 보낸다.
//
// 404 — 없는 알림, 또는 남의 알림(리소스 은닉). 두 경우가 같은 응답이라 구분할 수 없다.
export function markAsRead(notificationId: number) {
  return api.patch<Notification>(`/notifications/${notificationId}/read`);
}
