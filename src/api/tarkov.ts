const GRAPHQL_URL = "https://api.tarkov.dev/graphql";

export type GraphQLErrorPayload = {
  errors?: { message: string }[];
  data?: unknown;
};

export async function gql<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Tarkov.dev API: HTTP ${res.status}`);
  }

  const body = (await res.json()) as GraphQLErrorPayload & { data?: TData };

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }

  if (body.data === undefined) {
    throw new Error("Tarkov.dev API: empty response");
  }

  return body.data;
}
