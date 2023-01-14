import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

import { getPrevious } from "src/hooks/usePaginatedTransactions"

const previous = getPrevious()

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  // Take the previous transactions and append them to the new ones
  let firstDone = false
  let secondDone = false
  if (previous[1] !== undefined && !firstDone) {
    const firstSet = previous[1].data
    firstSet.forEach((transaction) => {
      transactions.push(transaction)
    })
    firstDone = true
  }
  if (previous[2] !== undefined && !secondDone) {
    const secondSet = previous[2].data
    secondSet.forEach((transaction) => {
      transactions.push(transaction)
    })
    secondDone = true
  }

  // Remove Duplicates
  let ids = []
  transactions.forEach((transaction) => {
    if (ids.includes(transaction.id) === false) {
      ids.push(transaction.id)
    } else {
      const index = transactions.indexOf(transaction)
      transactions.splice(index, 1)
    }
  }) 

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction, index) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
