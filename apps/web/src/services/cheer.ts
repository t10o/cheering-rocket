import { callFunction } from "@/libs/firebase";
import type {
  CheerSessionRequest,
  CheerSessionResponse,
  PostCheerMessagePayload,
  PostCheerMessageResponse,
} from "@/types/cheer";

type CloudFunctionName = "getCheerSession" | "postCheerMessage";

const invoke = async <TResult, TPayload>(
  name: CloudFunctionName,
  payload: TPayload,
) => callFunction<TResult, TPayload>(name, payload);

export const fetchCheerSession = async (payload: CheerSessionRequest) =>
  invoke<CheerSessionResponse, CheerSessionRequest>("getCheerSession", payload);

export const postCheerMessage = async (
  payload: PostCheerMessagePayload,
) => invoke<PostCheerMessageResponse, PostCheerMessagePayload>(
  "postCheerMessage",
  payload,
);
