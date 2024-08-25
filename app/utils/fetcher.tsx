export async function fetcher(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    return Promise.reject(response);
  }

  return await response.json();
}
