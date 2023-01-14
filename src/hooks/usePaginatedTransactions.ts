import { Console } from "console";
import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export let allDataLoaded = false;
export let previousData = [{}];

export function getVar() {
  return allDataLoaded
}

export function getPrevious() {
  return previousData
}

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      // Push Previous Data
      previousData.push(previousResponse)

      // Loads 5 transactions per "View More", If less than 5 than there is no more data to load //Need 6 to account for delay
      if (response.data.length < 6) {
        allDataLoaded = true
      } else {
        allDataLoaded = false
      }

      return { data: response.data, nextPage: response.nextPage, allDataLoaded }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
