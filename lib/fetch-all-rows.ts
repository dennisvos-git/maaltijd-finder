type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Haalt Supabase-resultaten in vaste pagina's op.
 * Zo worden resultaten boven de standaard API-limiet niet stilzwijgend afgekapt.
 */
export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = 500
): Promise<{ data: T[]; error: { message: string } | null }> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    return { data: [], error: { message: "Ongeldige paginagrootte." } };
  }

  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    try {
      const { data, error } = await fetchPage(from, from + pageSize - 1);
      if (error) return { data: [], error };
      const page = data ?? [];
      rows.push(...page);
      if (page.length < pageSize) return { data: rows, error: null };
    } catch {
      return { data: [], error: { message: "Ophalen van een gegevenspagina is mislukt." } };
    }
  }
}
