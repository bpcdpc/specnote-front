import { SchemaTree } from "./SchemaTree";
import { ExampleBlock } from "./ExampleBlock";
import { TryItPanel } from "./TryItPanel";
import { useTryIt, isMutating, mediaKind } from "./useTryIt";
import { useBearerToken } from "./BearerTokenContext";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SpecCache } from "./useSpecCache";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// 이 operation 이 요구하는 인증 스킴을 본다.
// http bearer 만 지원한다(UC-4). 그 외를 요구하면 이름을 돌려준다.
function checkAuth(
  operation: Record<string, unknown>,
  components: unknown,
): { needsAuth: boolean; unsupported: string | null } {
  const security = Array.isArray(operation.security) ? operation.security : [];
  if (security.length === 0) return { needsAuth: false, unsupported: null };

  const schemes =
    isObject(components) && isObject(components.securitySchemes)
      ? components.securitySchemes
      : {};

  let needsAuth = false;
  for (const requirement of security) {
    if (!isObject(requirement)) continue;
    for (const name of Object.keys(requirement)) {
      const scheme = schemes[name];
      if (
        isObject(scheme) &&
        scheme.type === "http" &&
        String(scheme.scheme).toLowerCase() === "bearer"
      ) {
        needsAuth = true;
      } else {
        const type = isObject(scheme) ? String(scheme.type) : name;
        return { needsAuth, unsupported: type };
      }
    }
  }
  return { needsAuth, unsupported: null };
}

// EndpointDetail — operation 조각을 구획으로 배치하고 Try it 입력을 붙인다.
//
// Swagger 와 달리 읽기·입력 모드를 나누지 않는다. 파라미터 행에 입력이 바로 붙고
// 요청 바디는 스키마 아래 textarea 에 조립된 example 이 채워진 채로 시작한다.
// 토글 버튼이 없으니 SchemaTree 를 읽기·입력 두 벌로 유지할 필요도 없다.
//
// 상태는 엔드포인트마다 초기화돼야 한다. 호출부가 key={endpoint.id} 로 리마운트시킨다.
export function EndpointDetail({
  method,
  path,
  operation,
  cache,
  components,
  baseUrl,
}: {
  method: string;
  path: string;
  operation: unknown;
  cache: SpecCache;
  components: unknown;
  baseUrl: string | null;
}) {
  const op = isObject(operation) ? operation : {};

  const parameters = Array.isArray(op.parameters)
    ? (op.parameters as Record<string, unknown>[])
    : [];
  const requestBody = isObject(op.requestBody) ? op.requestBody : null;
  const responses = isObject(op.responses) ? op.responses : null;

  const { token } = useBearerToken();
  const { needsAuth, unsupported } = checkAuth(op, components);

  const tryIt = useTryIt({
    method,
    path,
    parameters,
    requestBodyContent: requestBody?.content ?? null,
    baseUrl,
    token,
    needsAuth,
    cache,
  });

  const bodyMedia =
    tryIt.mediaType && isObject(requestBody?.content)
      ? requestBody.content[tryIt.mediaType]
      : null;
  const bodyKind = tryIt.mediaType ? mediaKind(tryIt.mediaType) : null;

  return (
    <div className="flex flex-col gap-8">
      {parameters.length > 0 && (
        <Section title="Parameters">
          <ParameterGroups
            parameters={parameters}
            cache={cache}
            values={tryIt.paramValues}
            onChange={tryIt.setParam}
          />
        </Section>
      )}

      {requestBody && (
        <Section title="Request Body">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {tryIt.mediaTypes.length > 1 ? (
                <select
                  value={tryIt.mediaType ?? ""}
                  onChange={(e) => tryIt.changeMediaType(e.target.value)}
                  aria-label="미디어 타입"
                  className="h-8 rounded-md border border-input-border bg-input-bg px-2 font-mono text-xs text-fg-1"
                >
                  {tryIt.mediaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-mono text-xs text-fg-3">
                  {tryIt.mediaType}
                </span>
              )}

              {isObject(bodyMedia) && (
                <RootTypeLabel schema={bodyMedia.schema} cache={cache} />
              )}
              {requestBody.required === true && (
                <span className="text-xs text-destructive">필수</span>
              )}
            </div>

            {isObject(bodyMedia) && (
              <SchemaTree schema={bodyMedia.schema ?? {}} cache={cache} root />
            )}

            {bodyKind === "unsupported" ? (
              <p className="text-sm text-fg-3">
                이 미디어 타입은 Try it out에서 지원하지 않습니다.
              </p>
            ) : (
              <textarea
                value={tryIt.body}
                onChange={(e) => tryIt.setBody(e.target.value)}
                aria-label="요청 바디"
                spellCheck={false}
                rows={Math.min(20, tryIt.body.split("\n").length + 1)}
                className="w-full resize-y rounded-md border border-input-border bg-input-bg p-3 font-mono text-xs leading-relaxed text-fg-1 focus-visible:border-border focus-visible:outline-none"
              />
            )}
          </div>
        </Section>
      )}

      <TryItPanel
        method={method}
        mutating={isMutating(method)}
        baseUrl={baseUrl}
        authUnsupported={unsupported}
        confirmed={tryIt.confirmed}
        onConfirm={tryIt.setConfirmed}
        loading={tryIt.loading}
        response={tryIt.response}
        error={tryIt.error}
        onExecute={tryIt.execute}
      />

      {responses && (
        <Section title="Responses">
          <div className="flex flex-col gap-5">
            {sortCodes(Object.keys(responses)).map((code) => (
              <ResponseItem
                key={code}
                code={code}
                response={responses[code]}
                cache={cache}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-fg-1">{title}</h3>
      {children}
    </section>
  );
}

const IN_ORDER = ["path", "query", "header", "cookie"] as const;

function ParameterGroups({
  parameters,
  cache,
  values,
  onChange,
}: {
  parameters: Record<string, unknown>[];
  cache: SpecCache;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {IN_ORDER.map((location) => {
        const list = parameters.filter((p) => p.in === location);
        if (list.length === 0) return null;

        return (
          <div key={location} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-fg-3">{location}</p>
            <ul className="flex flex-col gap-2">
              {list.map((param) => (
                <ParameterRow
                  key={String(param.name)}
                  param={param}
                  cache={cache}
                  value={values[String(param.name)] ?? ""}
                  onChange={onChange}
                  // cookie 는 브라우저가 스크립트로 못 붙인다.
                  disabled={location === "cookie"}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// 파라미터는 거의 항상 스칼라다. SchemaTree 를 쓰지 않고 한 행으로 그린다.
// enum 은 select, boolean 은 true/false, number 는 숫자 입력이다.
function ParameterRow({
  param,
  cache,
  value,
  onChange,
  disabled,
}: {
  param: Record<string, unknown>;
  cache: SpecCache;
  value: string;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}) {
  const name = String(param.name ?? "");
  const resolved = cache.resolve(param.schema ?? {});
  const schema = resolved.status === "ok" ? resolved.schema : {};

  const type = Array.isArray(schema.type)
    ? schema.type.join(" | ")
    : String(schema.type ?? "string");
  const enums = Array.isArray(schema.enum) ? (schema.enum as unknown[]) : null;
  const description =
    typeof param.description === "string" ? param.description : "";

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-xs text-fg-1">
          {name}
          {param.required === true && (
            <span className="ml-0.5 text-destructive" title="필수">
              *
            </span>
          )}
        </span>
        <span className="font-mono text-xs text-fg-3">{type}</span>
      </div>

      {enums ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          aria-label={name}
          className="h-9 w-full max-w-md rounded-md border border-input-border bg-input-bg px-2 font-mono text-xs text-fg-1 disabled:opacity-50"
        >
          <option value="">(비움)</option>
          {enums.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      ) : type === "boolean" ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          aria-label={name}
          className="h-9 w-full max-w-md rounded-md border border-input-border bg-input-bg px-2 font-mono text-xs text-fg-1 disabled:opacity-50"
        >
          <option value="">(비움)</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <Input
          type={type === "number" || type === "integer" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          aria-label={name}
          spellCheck={false}
          className="h-9 w-full max-w-md font-mono text-xs"
        />
      )}

      {description && <p className="text-xs text-fg-3">{description}</p>}
      {disabled && (
        <p className="text-xs text-fg-3">
          cookie 파라미터는 브라우저에서 직접 설정할 수 없습니다.
        </p>
      )}
    </li>
  );
}

function RootTypeLabel({
  schema,
  cache,
}: {
  schema: unknown;
  cache: SpecCache;
}) {
  const result = cache.resolve(schema);
  if (result.status !== "ok") return null;

  const node = result.schema;
  const isArray = node.type === "array";
  const inner = isArray ? cache.resolve(node.items) : result;
  if (inner.status !== "ok") return null;

  const name =
    inner.refName ??
    (typeof inner.schema.type === "string" ? inner.schema.type : "object");

  return (
    <span className="font-mono text-xs text-fg-2">
      {isArray ? `${name}[]` : name}
    </span>
  );
}

function ResponseItem({
  code,
  response,
  cache,
}: {
  code: string;
  response: unknown;
  cache: SpecCache;
}) {
  if (!isObject(response)) return null;

  const description =
    typeof response.description === "string" ? response.description : "";
  const content = isObject(response.content) ? response.content : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold",
            code.startsWith("2")
              ? "bg-get-bg text-get-fg"
              : "bg-delete-bg text-delete-fg",
          )}
        >
          {code}
        </span>
        {description ? (
          <span className="text-sm text-fg-2">{description}</span>
        ) : (
          !content && (
            <span className="text-xs text-fg-3">응답 스키마 없음</span>
          )
        )}
      </div>

      {content &&
        Object.entries(content).map(([mediaType, media]) => {
          if (!isObject(media)) return null;
          return (
            <div key={mediaType} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-fg-3">{mediaType}</span>
                <RootTypeLabel schema={media.schema} cache={cache} />
              </div>
              <SchemaTree schema={media.schema ?? {}} cache={cache} root />
              {/* 응답은 스펙에 있는 example 만 쓴다. 조립하지 않는다. */}
              {"example" in media && <ExampleBlock value={media.example} />}
            </div>
          );
        })}
    </div>
  );
}

function sortCodes(codes: string[]): string[] {
  return [...codes].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isNaN(na)) return 1;
    if (Number.isNaN(nb)) return -1;
    return na - nb;
  });
}
