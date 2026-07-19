export type ROLE = "OWNER" | "MEMBER";

export const REACTION_TYPES = ["DONE", "CHECKING", "BEST", "ACK"] as const;
export type REACTION_TYPE = (typeof REACTION_TYPES)[number];

export type NOTIFICATION_TYPE = "INVITED" | "MENTIONED";

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HTTP_METHOD = (typeof HTTP_METHODS)[number];
