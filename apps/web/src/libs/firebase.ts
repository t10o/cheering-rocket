import { env } from "@/config/env";

type CallableResponse<TResult> =
  | { result: TResult }
  | { data: TResult }
  | TResult;

type CallableErrorResponse = {
  error: {
    message?: string;
    status?: string;
    details?: unknown;
  };
};

const isErrorResponse = (value: unknown): value is CallableErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  typeof (value as { error: unknown }).error === "object";

const buildFunctionUrl = (name: string) => {
  if (env.functionsEmulatorOrigin) {
    const origin = env.functionsEmulatorOrigin.replace(/\/$/, "");
    return `${origin}/${env.firebase.projectId}/${env.functionsRegion}/${name}`;
  }
  return `https://${env.functionsRegion}-${env.firebase.projectId}.cloudfunctions.net/${name}`;
};

export const callFunction = async <TResult = unknown, TPayload = unknown>(
  name: string,
  payload: TPayload,
): Promise<TResult> => {
  const response = await fetch(buildFunctionUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: payload }),
    mode: "cors",
  });

  const json = (await response.json()) as unknown;

  if (!response.ok || isErrorResponse(json)) {
    const message =
      (isErrorResponse(json) && (json.error.message || json.error.status)) ||
      response.statusText ||
      "Firebase Functions call failed";
    throw new Error(message);
  }

  if (typeof json === "object" && json !== null) {
    if ("result" in json) {
      return (json as { result: TResult }).result;
    }
    if ("data" in json) {
      return (json as { data: TResult }).data;
    }
  }

  return json as TResult;
};
